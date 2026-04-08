"use client";

import { useState } from "react";
import MatchCard from "@/components/MatchCard";
import { getFlagUrl } from "@/lib/fixture-data";

const MOCK_MATCHES = [
  {
    id: 1, home_team_id: 1, away_team_id: 2,
    stage: "group", group_label: "A",
    match_date: new Date(Date.now() + 86400000 * 5).toISOString(),
    venue: "MetLife Stadium, New Jersey",
    status: "scheduled" as const, home_score: null, away_score: null,
    home_team: { name: "Estados Unidos", code: "USA", flag_url: getFlagUrl("USA") },
    away_team: { name: "Marruecos", code: "MAR", flag_url: getFlagUrl("MAR") },
  },
  {
    id: 2, home_team_id: 5, away_team_id: 6,
    stage: "group", group_label: "B",
    match_date: new Date(Date.now() + 86400000 * 6).toISOString(),
    venue: "Hard Rock Stadium, Miami",
    status: "scheduled" as const, home_score: null, away_score: null,
    home_team: { name: "Argentina", code: "ARG", flag_url: getFlagUrl("ARG") },
    away_team: { name: "Peru", code: "PER", flag_url: getFlagUrl("PER") },
  },
  {
    id: 3, home_team_id: 13, away_team_id: 14,
    stage: "group", group_label: "D",
    match_date: new Date(Date.now() - 3600000).toISOString(),
    venue: "Estadio Azteca, Mexico",
    status: "finished" as const, home_score: 2, away_score: 0,
    home_team: { name: "Brasil", code: "BRA", flag_url: getFlagUrl("BRA") },
    away_team: { name: "Colombia", code: "COL", flag_url: getFlagUrl("COL") },
  },
  {
    id: 4, home_team_id: 21, away_team_id: 22,
    stage: "group", group_label: "F",
    match_date: new Date(Date.now() + 86400000 * 2).toISOString(),
    venue: "AT&T Stadium, Dallas",
    status: "scheduled" as const, home_score: null, away_score: null,
    home_team: { name: "Alemania", code: "GER", flag_url: getFlagUrl("GER") },
    away_team: { name: "Uruguay", code: "URU", flag_url: getFlagUrl("URU") },
  },
];

export default function FixturePage() {
  const [predictions, setPredictions] = useState<Record<number, { home_score: number; away_score: number }>>({});

  function handlePredict(matchId: number, homeScore: number, awayScore: number) {
    setPredictions((prev) => ({ ...prev, [matchId]: { home_score: homeScore, away_score: awayScore } }));
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="font-sora font-bold text-2xl mb-1">Fixture</h1>
        <p className="text-text-secondary text-sm">Carga tus pronosticos para cada partido.</p>
      </div>

      <div className="space-y-3">
        {MOCK_MATCHES.map((match) => (
          <MatchCard
            key={match.id}
            match={match}
            prediction={
              predictions[match.id]
                ? { id: "", user_id: "", match_id: match.id, ...predictions[match.id], created_at: "", updated_at: "" }
                : undefined
            }
            onPredict={handlePredict}
          />
        ))}
      </div>
    </div>
  );
}
