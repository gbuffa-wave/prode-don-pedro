import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import { buildReminderEmail } from "@/lib/email-template";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
const resend = new Resend(process.env.RESEND_API_KEY!);

export async function POST(request: Request) {
  try {
    // Get tomorrow's date range
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfter = new Date(tomorrow);
    dayAfter.setDate(dayAfter.getDate() + 1);

    const startOfTomorrow = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate()).toISOString();
    const endOfTomorrow = new Date(dayAfter.getFullYear(), dayAfter.getMonth(), dayAfter.getDate()).toISOString();

    // Get tomorrow's matches
    const { data: matches } = await supabase
      .from("matches")
      .select("id, match_date, group_label, home_team:teams!home_team_id(name), away_team:teams!away_team_id(name)")
      .gte("match_date", startOfTomorrow)
      .lt("match_date", endOfTomorrow)
      .eq("status", "scheduled");

    if (!matches || matches.length === 0) {
      return Response.json({ message: "No hay partidos mañana", sent: 0 });
    }

    // Get all users with their auth emails
    const { data: appUsers } = await supabase.from("app_users").select("id, display_name");
    if (!appUsers) return Response.json({ error: "No users found" }, { status: 500 });

    // Get auth users to get emails
    const { data: { users: authUsers } } = await supabase.auth.admin.listUsers();

    let sentCount = 0;

    for (const appUser of appUsers) {
      // Find auth user to get email
      const authUser = authUsers?.find(u => u.id === appUser.id);
      if (!authUser?.email) continue;

      // Get this user's predictions for tomorrow's matches
      const matchIds = matches.map((m: any) => m.id);
      const { data: predictions } = await supabase
        .from("predictions")
        .select("match_id")
        .eq("user_id", appUser.id)
        .in("match_id", matchIds);

      const predictedMatchIds = new Set(predictions?.map(p => p.match_id) || []);
      const pendingMatches = matches.filter((m: any) => !predictedMatchIds.has(m.id));

      if (pendingMatches.length === 0) continue;

      // Build and send email
      const pendingForEmail = pendingMatches.map((m: any) => ({
        homeTeam: m.home_team?.name || "TBD",
        awayTeam: m.away_team?.name || "TBD",
        matchDate: new Date(m.match_date).toLocaleString("es-AR", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }),
        group: m.group_label || "",
      }));

      const firstName = appUser.display_name?.split(" ")[0] || "Jugador";
      const html = buildReminderEmail(firstName, pendingForEmail);

      await resend.emails.send({
        from: process.env.EMAIL_FROM || "Prode 2026 <onboarding@resend.dev>",
        to: authUser.email,
        subject: `⚽ ${pendingMatches.length} partido${pendingMatches.length !== 1 ? "s" : ""} sin pronosticar — Prode 2026`,
        html,
      });

      sentCount++;
    }

    // Log the send
    await supabase.from("app_config").upsert({
      key: "last_reminder_sent",
      value: JSON.stringify({ date: new Date().toISOString(), sent: sentCount, matches: matches.length }),
    });

    return Response.json({ success: true, sent: sentCount, matchesCount: matches.length });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
