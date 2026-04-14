"use client";

import { Clock, MapPin } from "@phosphor-icons/react";
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

const CHANNEL_LOGOS: Record<string, { src: string; height: string }> = {
  "Telefe":      { src: "/logos/telefe.svg",    height: "h-5" },
  "TV Pública":  { src: "/logos/tvpublica.svg", height: "h-5" },
  "DSports":     { src: "/logos/dsports.png",   height: "h-4" },
  "DirecTV Go":  { src: "/logos/dgo.svg",       height: "h-4" },
};

function ChannelLogos({ channels }: { channels: string }) {
  const list = channels.split(" · ").map((c) => c.trim());
  return (
    <div className="flex items-center justify-center gap-3">
      {list.map((channel) => {
        const logo = CHANNEL_LOGOS[channel];
        if (!logo) return null;
        return (
          <img
            key={channel}
            src={logo.src}
            alt={channel}
            title={channel}
            className={`${logo.height} w-auto object-contain`}
          />
        );
      })}
    </div>
  );
}

export default function MatchCard({ match, prediction, onPredict }: Props) {
  const isFinished = match.status === "finished";
  const isClosed = match.status !== "scheduled" || new Date(match.match_date) <= new Date();

  return (
    <div className={`bg-surface border rounded-lg p-4 space-y-3 ${match.status === "in_progress" ? "pulse-live border-success" : "border-border"}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs text-text-muted font-medium uppercase tracking-wider">
          {match.group_label ? `Grupo ${match.group_label}` : match.stage}
        </span>
        {match.status === "in_progress" && (
          <span className="flex items-center gap-1.5 text-xs font-semibold text-success">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-danger opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-danger" />
            </span>
            EN VIVO
          </span>
        )}
        {match.status === "scheduled" && <CountdownTimer targetDate={match.match_date} />}
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

      {/* Time, venue and TV */}
      <div className="border-t border-border pt-2 space-y-2">
        <div className="flex items-center justify-center gap-2 text-xs text-text-secondary">
          <span className="flex items-center gap-1 font-medium">
            <Clock size={13} weight="bold" />
            {new Date(match.match_date).toLocaleTimeString("es-AR", {
              hour: "2-digit",
              minute: "2-digit",
              timeZone: "America/Argentina/Buenos_Aires",
            })}{" "}
            hs
          </span>
          {match.venue && (
            <>
              <span className="text-border">·</span>
              <span className="flex items-center gap-1 min-w-0">
                <MapPin size={13} weight="bold" className="flex-shrink-0" />
                <span className="truncate font-medium">{match.venue}</span>
              </span>
            </>
          )}
        </div>
        {match.tv_channel && <ChannelLogos channels={match.tv_channel} />}
      </div>
    </div>
  );
}
