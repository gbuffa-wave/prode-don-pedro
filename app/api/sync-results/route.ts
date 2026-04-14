import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { calculateMatchScores } from "@/lib/scoring";
import { requireCronOrAdmin } from "@/lib/require-admin";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const FOOTBALL_API_URL =
  "https://api.football-data.org/v4/competitions/WC/matches";

// Map football-data.org status to our status
function mapStatus(apiStatus: string): string {
  switch (apiStatus) {
    case "FINISHED":
      return "finished";
    case "IN_PLAY":
    case "PAUSED":
    case "HALFTIME":
      return "in_progress";
    default:
      return "scheduled";
  }
}

export async function GET(request: Request) {
  const authError = await requireCronOrAdmin(request);
  if (authError) return authError;

  try {
    const apiKey = process.env.FOOTBALL_DATA_API_KEY;

    // If no API key, results must be updated manually
    if (!apiKey) {
      return NextResponse.json({
        message:
          "No FOOTBALL_DATA_API_KEY set. Results must be updated manually.",
        updated: 0,
      });
    }

    // Fetch matches from football-data.org
    const response = await fetch(FOOTBALL_API_URL, {
      headers: {
        "X-Auth-Token": apiKey,
      },
      next: { revalidate: 0 },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `API error: ${response.status}` },
        { status: 500 }
      );
    }

    const data = await response.json();
    const apiMatches = data.matches || [];

    // Get our matches with team codes
    const { data: ourMatches } = await supabase
      .from("matches")
      .select(
        "id, home_team_id, away_team_id, status, home_score, away_score, match_date, venue, home_team:teams!home_team_id(code), away_team:teams!away_team_id(code)"
      );

    if (!ourMatches) {
      return NextResponse.json(
        { error: "Could not fetch our matches" },
        { status: 500 }
      );
    }

    let updatedCount = 0;

    for (const apiMatch of apiMatches) {
      const newStatus = mapStatus(apiMatch.status);
      const homeCode = apiMatch.homeTeam?.tla;
      const awayCode = apiMatch.awayTeam?.tla;
      const homeScore = apiMatch.score?.fullTime?.home ?? null;
      const awayScore = apiMatch.score?.fullTime?.away ?? null;
      const venue = apiMatch.venue ?? null;

      if (!homeCode || !awayCode) continue;

      // Find matching match in our DB
      const ourMatch = ourMatches.find((m: any) => {
        const ourHome = m.home_team?.code;
        const ourAway = m.away_team?.code;
        return ourHome === homeCode && ourAway === awayCode;
      });

      if (!ourMatch) continue;

      // Check if there's something to update
      const needsUpdate =
        ourMatch.status !== newStatus ||
        ourMatch.home_score !== homeScore ||
        ourMatch.away_score !== awayScore ||
        (venue && ourMatch.venue !== venue);

      if (!needsUpdate) continue;

      // Update match
      const updateData: any = { status: newStatus };
      if (homeScore !== null) updateData.home_score = homeScore;
      if (awayScore !== null) updateData.away_score = awayScore;
      if (venue) updateData.venue = venue;

      await supabase.from("matches").update(updateData).eq("id", ourMatch.id);

      // If match just finished, calculate scores
      if (newStatus === "finished" && ourMatch.status !== "finished") {
        await calculateMatchScores(ourMatch.id);
      }

      updatedCount++;
    }

    // Check if final is finished -> auto-set champion
    const finalMatch = ourMatches.find((m: any) => {
      return (
        m.status === "finished" &&
        apiMatches.some(
          (am: any) =>
            am.stage === "FINAL" &&
            mapStatus(am.status) === "finished" &&
            am.homeTeam?.tla === (m as any).home_team?.code
        )
      );
    });

    if (finalMatch) {
      const fHome = (finalMatch as any).home_team?.code;
      const fAway = (finalMatch as any).away_team?.code;

      if (
        finalMatch.home_score !== null &&
        finalMatch.away_score !== null
      ) {
        let championCode: string | null = null;
        if (finalMatch.home_score > finalMatch.away_score) {
          championCode = fHome;
        } else if (finalMatch.away_score > finalMatch.home_score) {
          championCode = fAway;
        }

        if (championCode) {
          // Check if champion already set
          const { data: existing } = await supabase
            .from("app_config")
            .select("value")
            .eq("key", "champion")
            .single();

          if (!existing) {
            // Get full team name
            const { data: champTeam } = await supabase
              .from("teams")
              .select("name, code")
              .eq("code", championCode)
              .single();

            if (champTeam) {
              await supabase.from("app_config").upsert({
                key: "champion",
                value: JSON.stringify({
                  name: champTeam.name,
                  code: champTeam.code,
                }),
              });
            }
          }
        }
      }
    }

    return NextResponse.json({ success: true, updated: updatedCount });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
