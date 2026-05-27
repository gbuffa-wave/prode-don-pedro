import { Resend } from "resend";
import { buildReminderEmail } from "@/lib/email-template";
import { requireAdmin } from "@/lib/require-admin";
import { getAdminClient } from "@/lib/supabase/admin";
import { sendRemindersBodySchema, parseBody } from "@/lib/schemas";
import { brand } from "@/lib/brand";

const supabase = getAdminClient();
const resend = new Resend(process.env.RESEND_API_KEY!);

type MatchRow = {
  id: number;
  match_date: string;
  group_label: string | null;
  home_team: { name: string; code: string } | null;
  away_team: { name: string; code: string } | null;
};

function formatMatchForEmail(m: MatchRow) {
  return {
    homeTeam: m.home_team?.name || "TBD",
    awayTeam: m.away_team?.name || "TBD",
    homeCode: m.home_team?.code || "",
    awayCode: m.away_team?.code || "",
    matchDate: new Date(m.match_date).toLocaleString("es-AR", {
      weekday: "short",
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }),
    group: m.group_label || "",
  };
}

export async function POST(request: Request) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  try {
    const parsed = await parseBody(request, sendRemindersBodySchema);
    if ("error" in parsed) return parsed.error;
    const isTest = parsed.data.test === true;

    const baseSelect =
      "id, match_date, group_label, home_team:teams!home_team_id(name,code), away_team:teams!away_team_id(name,code)";

    let matches: MatchRow[] | null = null;

    if (isTest) {
      const { data } = await supabase
        .from("matches")
        .select(baseSelect)
        .eq("status", "scheduled")
        .order("match_date")
        .limit(4)
        .returns<MatchRow[]>();
      matches = data;
    } else {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dayAfter = new Date(tomorrow);
      dayAfter.setDate(dayAfter.getDate() + 1);

      const startOfTomorrow = new Date(
        tomorrow.getFullYear(),
        tomorrow.getMonth(),
        tomorrow.getDate()
      ).toISOString();
      const endOfTomorrow = new Date(
        dayAfter.getFullYear(),
        dayAfter.getMonth(),
        dayAfter.getDate()
      ).toISOString();

      const { data } = await supabase
        .from("matches")
        .select(baseSelect)
        .gte("match_date", startOfTomorrow)
        .lt("match_date", endOfTomorrow)
        .eq("status", "scheduled")
        .returns<MatchRow[]>();
      matches = data;
    }

    if (!matches || matches.length === 0) {
      return Response.json({ message: "No hay partidos para notificar", sent: 0 });
    }

    const matchIds = matches.map((m) => m.id);

    const { data: appUsers } = await supabase
      .from("app_users")
      .select("id, display_name");
    if (!appUsers) {
      return Response.json({ error: "No users found" }, { status: 500 });
    }

    // UNA sola query para todas las predicciones de estos matches
    const { data: allPredictions } = await supabase
      .from("predictions")
      .select("user_id, match_id")
      .in("match_id", matchIds);

    const predsByUser = new Map<string, Set<number>>();
    for (const p of allPredictions ?? []) {
      const set = predsByUser.get(p.user_id) ?? new Set<number>();
      set.add(p.match_id);
      predsByUser.set(p.user_id, set);
    }

    const {
      data: { users: authUsers },
    } = await supabase.auth.admin.listUsers();
    const emailById = new Map<string, string>();
    for (const u of authUsers ?? []) {
      if (u.email) emailById.set(u.id, u.email);
    }

    let sentCount = 0;

    for (const appUser of appUsers) {
      const email = emailById.get(appUser.id);
      if (!email) continue;

      const userPreds = predsByUser.get(appUser.id) ?? new Set<number>();
      const pendingMatches = matches.filter((m) => !userPreds.has(m.id));
      if (pendingMatches.length === 0) continue;

      const firstName = appUser.display_name?.split(" ")[0] || "Jugador";
      const html = buildReminderEmail(firstName, pendingMatches.map(formatMatchForEmail));

      const prefix = isTest ? "🧪 [TEST] " : "";
      const plural = pendingMatches.length !== 1 ? "s" : "";
      await resend.emails.send({
        from: process.env.EMAIL_FROM || "Prode 2026 <onboarding@resend.dev>",
        to: email,
        subject: `${prefix}⚽ ${pendingMatches.length} partido${plural} sin pronosticar — ${brand.tournamentName}`,
        html,
      });

      sentCount++;
    }

    await supabase.from("app_config").upsert({
      key: "last_reminder_sent",
      value: JSON.stringify({
        date: new Date().toISOString(),
        sent: sentCount,
        matches: matches.length,
        test: isTest,
      }),
    });

    return Response.json({
      success: true,
      sent: sentCount,
      matchesCount: matches.length,
      test: isTest,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown error";
    return Response.json({ error: message }, { status: 500 });
  }
}
