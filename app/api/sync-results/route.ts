import { NextResponse } from "next/server";
import { calculateMatchScores } from "@/lib/scoring";
import { requireCronOrAdmin } from "@/lib/require-admin";
import { getAdminClient } from "@/lib/supabase/admin";
import type { MatchStatus } from "@/lib/types";

const supabase = getAdminClient();

const FOOTBALL_API_URL =
  "https://api.football-data.org/v4/competitions/WC/matches";

type ApiMatch = {
  status: string;
  stage?: string;
  homeTeam?: { tla?: string };
  awayTeam?: { tla?: string };
  score?: { fullTime?: { home: number | null; away: number | null } };
  venue?: string;
};

type OurMatchRow = {
  id: number;
  home_team_id: number;
  away_team_id: number;
  status: MatchStatus;
  home_score: number | null;
  away_score: number | null;
  match_date: string;
  venue: string | null;
  home_team: { code: string } | null;
  away_team: { code: string } | null;
};

type MatchUpdate = {
  status: MatchStatus;
  home_score?: number;
  away_score?: number;
  venue?: string;
};

function mapStatus(apiStatus: string): MatchStatus {
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

    const data: { matches?: ApiMatch[] } = await response.json();
    const apiMatches = data.matches ?? [];

    const { data: ourMatches } = await supabase
      .from("matches")
      .select(
        "id, home_team_id, away_team_id, status, home_score, away_score, match_date, venue, home_team:teams!home_team_id(code), away_team:teams!away_team_id(code)"
      )
      .returns<OurMatchRow[]>();

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

      const ourMatch = ourMatches.find(
        (m) => m.home_team?.code === homeCode && m.away_team?.code === awayCode
      );
      if (!ourMatch) continue;

      const needsUpdate =
        ourMatch.status !== newStatus ||
        ourMatch.home_score !== homeScore ||
        ourMatch.away_score !== awayScore ||
        (venue && ourMatch.venue !== venue);

      if (!needsUpdate) continue;

      const updateData: MatchUpdate = { status: newStatus };
      if (homeScore !== null) updateData.home_score = homeScore;
      if (awayScore !== null) updateData.away_score = awayScore;
      if (venue) updateData.venue = venue;

      await supabase.from("matches").update(updateData).eq("id", ourMatch.id);

      if (newStatus === "finished" && ourMatch.status !== "finished") {
        await calculateMatchScores(ourMatch.id);
      }

      updatedCount++;
    }

    // Auto-set champion_code en app_config cuando la final está finished
    const finalApiMatch = apiMatches.find(
      (am) => am.stage === "FINAL" && mapStatus(am.status) === "finished"
    );
    if (finalApiMatch) {
      const fHome = finalApiMatch.homeTeam?.tla;
      const fAway = finalApiMatch.awayTeam?.tla;
      const fHomeScore = finalApiMatch.score?.fullTime?.home ?? null;
      const fAwayScore = finalApiMatch.score?.fullTime?.away ?? null;

      let championCode: string | null = null;
      if (fHomeScore !== null && fAwayScore !== null) {
        if (fHomeScore > fAwayScore) championCode = fHome ?? null;
        else if (fAwayScore > fHomeScore) championCode = fAway ?? null;
      }

      if (championCode) {
        const { data: existing } = await supabase
          .from("app_config")
          .select("value")
          .eq("key", "champion_code")
          .maybeSingle();

        if (!existing) {
          await supabase
            .from("app_config")
            .upsert({ key: "champion_code", value: championCode });
        }
      }
    }

    return NextResponse.json({ success: true, updated: updatedCount });
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
