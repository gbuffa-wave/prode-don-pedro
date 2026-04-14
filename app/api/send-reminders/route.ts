import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import { buildReminderEmail } from "@/lib/email-template";
import { requireAdmin } from "@/lib/require-admin";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
const resend = new Resend(process.env.RESEND_API_KEY!);

export async function POST(request: Request) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  try {
    const body = await request.json().catch(() => ({}));
    const isTest = body.test === true;

    let matches;

    if (isTest) {
      // Test mode: get next 4 scheduled matches regardless of date
      const { data } = await supabase
        .from("matches")
        .select("id, match_date, group_label, home_team:teams!home_team_id(name,code), away_team:teams!away_team_id(name,code)")
        .eq("status", "scheduled")
        .order("match_date")
        .limit(4);
      matches = data;
    } else {
      // Production mode: get tomorrow's matches
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dayAfter = new Date(tomorrow);
      dayAfter.setDate(dayAfter.getDate() + 1);

      const startOfTomorrow = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate()).toISOString();
      const endOfTomorrow = new Date(dayAfter.getFullYear(), dayAfter.getMonth(), dayAfter.getDate()).toISOString();

      const { data } = await supabase
        .from("matches")
        .select("id, match_date, group_label, home_team:teams!home_team_id(name,code), away_team:teams!away_team_id(name,code)")
        .gte("match_date", startOfTomorrow)
        .lt("match_date", endOfTomorrow)
        .eq("status", "scheduled");
      matches = data;
    }

    if (!matches || matches.length === 0) {
      return Response.json({ message: "No hay partidos para notificar", sent: 0 });
    }

    // Get all users
    const { data: appUsers } = await supabase.from("app_users").select("id, display_name");
    if (!appUsers) return Response.json({ error: "No users found" }, { status: 500 });

    // Get auth users to get emails
    const { data: { users: authUsers } } = await supabase.auth.admin.listUsers();

    let sentCount = 0;
    const sentTo: string[] = [];

    for (const appUser of appUsers) {
      const authUser = authUsers?.find(u => u.id === appUser.id);
      if (!authUser?.email) continue;

      // Check pending predictions
      const matchIds = matches.map((m: any) => m.id);
      const { data: predictions } = await supabase
        .from("predictions")
        .select("match_id")
        .eq("user_id", appUser.id)
        .in("match_id", matchIds);

      const predictedMatchIds = new Set(predictions?.map(p => p.match_id) || []);
      const pendingMatches = matches.filter((m: any) => !predictedMatchIds.has(m.id));

      if (pendingMatches.length === 0) continue;

      const pendingForEmail = pendingMatches.map((m: any) => ({
        homeTeam: m.home_team?.name || "TBD",
        awayTeam: m.away_team?.name || "TBD",
        homeCode: m.home_team?.code || "",
        awayCode: m.away_team?.code || "",
        matchDate: new Date(m.match_date).toLocaleString("es-AR", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }),
        group: m.group_label || "",
      }));

      const firstName = appUser.display_name?.split(" ")[0] || "Jugador";
      const html = buildReminderEmail(firstName, pendingForEmail);

      await resend.emails.send({
        from: process.env.EMAIL_FROM || "Prode 2026 <onboarding@resend.dev>",
        to: authUser.email,
        subject: isTest
          ? `🧪 [TEST] ⚽ ${pendingMatches.length} partido${pendingMatches.length !== 1 ? "s" : ""} sin pronosticar — Prode 2026`
          : `⚽ ${pendingMatches.length} partido${pendingMatches.length !== 1 ? "s" : ""} sin pronosticar — Prode 2026`,
        html,
      });

      sentCount++;
      sentTo.push(authUser.email);
    }

    // Log
    await supabase.from("app_config").upsert({
      key: "last_reminder_sent",
      value: JSON.stringify({ date: new Date().toISOString(), sent: sentCount, matches: matches.length, test: isTest }),
    });

    return Response.json({ success: true, sent: sentCount, matchesCount: matches.length, sentTo, test: isTest });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
