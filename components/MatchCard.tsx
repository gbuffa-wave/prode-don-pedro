"use client";

import CountdownTimer from "./CountdownTimer";
import PredictionForm from "./PredictionForm";
import type { Match, Prediction } from "@/lib/types";

type MatchWithTeams = Omit<Match, "home_team" | "away_team"> & {
  home_team: { name: string; code: string; flag_url: string };
  away_team: { name: string; code: string; flag_url: string };
};

interface Props {
  match: MatchWithTeams;
  prediction?: Prediction;
  onPredict: (matchId: number, homeScore: number, awayScore: number) => void;
}

export default function MatchCard({ match, prediction, onPredict }: Props) {
  const isFinished = match.status === "finished";
  const isClosed = match.status !== "scheduled" || new Date(match.match_date) <= new Date();

  return (
    <div className="bg-surface border border-border rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs text-text-muted font-medium uppercase tracking-wider">
          {match.group_label ? `Grupo ${match.group_label}` : match.stage}
        </span>
        {!isFinished && <CountdownTimer targetDate={match.match_date} />}
        {isFinished && (
          <span className="text-xs font-semibold text-success">Finalizado</span>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 flex-1">
          <img src={match.home_team.flag_url} alt={match.home_team.code} className="w-8 h-5 object-cover rounded-sm" />
          <span className="font-grotesk font-medium text-sm text-text-primary truncate">
            {match.home_team.name}
          </span>
        </div>

        <div className="flex-shrink-0 mx-3">
          {isFinished ? (
            <div className="flex items-center gap-2">
              <span className="font-sora font-bold text-2xl text-text-primary">{match.home_score}</span>
              <span className="text-text-muted">-</span>
              <span className="font-sora font-bold text-2xl text-text-primary">{match.away_score}</span>
            </div>
          ) : (
            <PredictionForm
              matchId={match.id}
              existingHome={prediction?.home_score}
              existingAway={prediction?.away_score}
              disabled={isClosed}
              onSubmit={onPredict}
            />
          )}
        </div>

        <div className="flex items-center gap-2 flex-1 justify-end">
          <span className="font-grotesk font-medium text-sm text-text-primary truncate text-right">
            {match.away_team.name}
          </span>
          <img src={match.away_team.flag_url} alt={match.away_team.code} className="w-8 h-5 object-cover rounded-sm" />
        </div>
      </div>

      {prediction && !isFinished && (
        <div className="text-center">
          <span className="text-xs text-teal font-medium">
            Tu pronostico: {prediction.home_score} - {prediction.away_score}
          </span>
        </div>
      )}

      {isFinished && prediction && (
        <div className="text-center pt-1 border-t border-border">
          <span className="text-xs text-text-muted">Tu pronostico: {prediction.home_score} - {prediction.away_score}</span>
        </div>
      )}
    </div>
  );
}
