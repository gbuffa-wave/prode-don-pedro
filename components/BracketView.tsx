"use client";

import { useState, useCallback } from "react";
import { getFlagUrl } from "@/lib/fixture-data";
import confetti from "canvas-confetti";
import { useToast } from "@/components/Toast";

interface BracketMatch {
  id: number;
  round: string;
  position: number;
  home: { name: string; code: string } | null;
  away: { name: string; code: string } | null;
  home_score: number | null;
  away_score: number | null;
  status: "scheduled" | "in_progress" | "finished";
}

// Mock knockout matches
const INITIAL_KNOCKOUT: BracketMatch[] = [
  // Round of 16
  { id: 101, round: "octavos", position: 1, home: { name: "Estados Unidos", code: "USA" }, away: { name: "Colombia", code: "COL" }, home_score: null, away_score: null, status: "scheduled" },
  { id: 102, round: "octavos", position: 2, home: { name: "Argentina", code: "ARG" }, away: { name: "Japon", code: "JPN" }, home_score: null, away_score: null, status: "scheduled" },
  { id: 103, round: "octavos", position: 3, home: { name: "Francia", code: "FRA" }, away: { name: "Corea del Sur", code: "KOR" }, home_score: null, away_score: null, status: "scheduled" },
  { id: 104, round: "octavos", position: 4, home: { name: "Brasil", code: "BRA" }, away: { name: "Senegal", code: "SEN" }, home_score: null, away_score: null, status: "scheduled" },
  { id: 105, round: "octavos", position: 5, home: { name: "Alemania", code: "GER" }, away: { name: "Marruecos", code: "MAR" }, home_score: null, away_score: null, status: "scheduled" },
  { id: 106, round: "octavos", position: 6, home: { name: "Espana", code: "ESP" }, away: { name: "Chile", code: "CHI" }, home_score: null, away_score: null, status: "scheduled" },
  { id: 107, round: "octavos", position: 7, home: { name: "Inglaterra", code: "ENG" }, away: { name: "Uruguay", code: "URU" }, home_score: null, away_score: null, status: "scheduled" },
  { id: 108, round: "octavos", position: 8, home: { name: "Portugal", code: "POR" }, away: { name: "Croacia", code: "CRO" }, home_score: null, away_score: null, status: "scheduled" },
  // Quarters
  { id: 201, round: "cuartos", position: 1, home: null, away: null, home_score: null, away_score: null, status: "scheduled" },
  { id: 202, round: "cuartos", position: 2, home: null, away: null, home_score: null, away_score: null, status: "scheduled" },
  { id: 203, round: "cuartos", position: 3, home: null, away: null, home_score: null, away_score: null, status: "scheduled" },
  { id: 204, round: "cuartos", position: 4, home: null, away: null, home_score: null, away_score: null, status: "scheduled" },
  // Semis
  { id: 301, round: "semi", position: 1, home: null, away: null, home_score: null, away_score: null, status: "scheduled" },
  { id: 302, round: "semi", position: 2, home: null, away: null, home_score: null, away_score: null, status: "scheduled" },
  // Final
  { id: 401, round: "final", position: 1, home: null, away: null, home_score: null, away_score: null, status: "scheduled" },
];

const ROUND_LABELS: Record<string, string> = {
  octavos: "Octavos de final",
  cuartos: "Cuartos de final",
  semi: "Semifinales",
  final: "Final",
};

const ROUND_SHORT: Record<string, string> = {
  octavos: "Octavos",
  cuartos: "Cuartos",
  semi: "Semi",
  final: "Final",
};

function TeamSlot({
  team,
  score,
  isWinner,
  editable,
  scoreValue,
  onScoreChange,
}: {
  team: { name: string; code: string } | null;
  score: number | null;
  isWinner?: boolean;
  editable?: boolean;
  scoreValue?: string;
  onScoreChange?: (val: string) => void;
}) {
  return (
    <div className={`flex items-center gap-2 px-2.5 py-1.5 ${isWinner ? "bg-teal/10" : ""}`}>
      {team ? (
        <>
          <img
            src={getFlagUrl(team.code)}
            alt={team.code}
            className="w-5 h-3.5 object-cover rounded-sm flex-shrink-0"
          />
          <span className={`text-xs font-medium truncate flex-1 ${isWinner ? "text-teal font-semibold" : "text-text-primary"}`}>
            {team.name}
          </span>
          {editable ? (
            <input
              type="number"
              min={0}
              max={20}
              value={scoreValue ?? ""}
              onChange={(e) => onScoreChange?.(e.target.value)}
              className="w-8 h-6 text-center font-sora font-bold text-xs bg-bg border border-border rounded focus:border-teal focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              placeholder="-"
            />
          ) : score !== null ? (
            <span className={`font-sora font-bold text-xs ${isWinner ? "text-teal" : "text-text-primary"}`}>
              {score}
            </span>
          ) : null}
        </>
      ) : (
        <>
          <div className="w-5 h-3.5 rounded-sm bg-border flex-shrink-0" />
          <span className="text-xs text-text-muted italic flex-1">Por definir</span>
        </>
      )}
    </div>
  );
}

function BracketMatchCard({
  match,
  onPredict,
  prediction,
}: {
  match: BracketMatch;
  onPredict: (matchId: number, home: number, away: number) => void;
  prediction?: { home: number; away: number };
}) {
  const [editing, setEditing] = useState(false);
  const [homeVal, setHomeVal] = useState(prediction?.home?.toString() ?? "");
  const [awayVal, setAwayVal] = useState(prediction?.away?.toString() ?? "");
  const { showToast } = useToast();

  const homeWins = match.status === "finished" && match.home_score !== null && match.away_score !== null && match.home_score > match.away_score;
  const awayWins = match.status === "finished" && match.home_score !== null && match.away_score !== null && match.away_score > match.home_score;
  const canPredict = match.home !== null && match.away !== null && match.status === "scheduled";
  const hasPrediction = prediction !== undefined;

  const fireConfetti = useCallback(() => {
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.7 },
      colors: ["#0c5cac", "#D4A853", "#22C55E", "#F59E0B", "#EF4444", "#ffffff"],
    });
  }, []);

  function handleSave() {
    const h = parseInt(homeVal);
    const a = parseInt(awayVal);
    if (isNaN(h) || isNaN(a) || h < 0 || a < 0) return;
    const isNew = !hasPrediction;
    onPredict(match.id, h, a);
    setEditing(false);
    showToast("¡Pronóstico guardado!");
    if (isNew) fireConfetti();
  }

  return (
    <div className="bg-surface border border-border rounded overflow-hidden w-full min-w-[160px]">
      <TeamSlot
        team={match.home}
        score={match.home_score}
        isWinner={homeWins}
        editable={editing}
        scoreValue={homeVal}
        onScoreChange={setHomeVal}
      />
      <div className="h-px bg-border" />
      <TeamSlot
        team={match.away}
        score={match.away_score}
        isWinner={awayWins}
        editable={editing}
        scoreValue={awayVal}
        onScoreChange={setAwayVal}
      />

      {/* Prediction controls */}
      {canPredict && (
        <div className="border-t border-border">
          {editing ? (
            <div className="flex gap-1 p-1.5">
              <button
                onClick={handleSave}
                disabled={!homeVal || !awayVal}
                className="flex-1 text-[10px] font-semibold py-1 bg-teal text-bg rounded hover:bg-teal-dim transition-colors disabled:opacity-30"
              >
                Guardar
              </button>
              <button
                onClick={() => setEditing(false)}
                className="px-2 text-[10px] text-text-muted hover:text-text-primary transition-colors"
              >
                ✕
              </button>
            </div>
          ) : hasPrediction ? (
            <div className="flex items-center justify-between px-2.5 py-1.5">
              <span className="text-[10px] text-teal font-medium">
                Tu: {prediction.home} - {prediction.away}
              </span>
              <button
                onClick={() => {
                  setHomeVal(prediction.home.toString());
                  setAwayVal(prediction.away.toString());
                  setEditing(true);
                }}
                className="text-[10px] text-text-muted hover:text-teal transition-colors"
              >
                Editar
              </button>
            </div>
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="w-full text-[10px] font-medium text-teal hover:bg-teal/5 py-1.5 transition-colors"
            >
              Cargar pronóstico
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// Mobile: vertical list by round
function MobileBracket({
  matches,
  predictions,
  onPredict,
}: {
  matches: BracketMatch[];
  predictions: Record<number, { home: number; away: number }>;
  onPredict: (matchId: number, home: number, away: number) => void;
}) {
  const rounds = ["octavos", "cuartos", "semi", "final"];

  return (
    <div className="space-y-6">
      {rounds.map((round) => {
        const roundMatches = matches.filter((m) => m.round === round);
        return (
          <div key={round}>
            <div className="flex items-center gap-3 mb-3">
              <span className="font-grotesk font-semibold text-xs text-teal uppercase tracking-wider">
                {ROUND_LABELS[round]}
              </span>
              <div className="flex-1 h-px bg-border" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              {roundMatches.map((match) => (
                <BracketMatchCard
                  key={match.id}
                  match={match}
                  prediction={predictions[match.id]}
                  onPredict={onPredict}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Desktop: horizontal bracket with connectors
function DesktopBracket({
  matches,
  predictions,
  onPredict,
}: {
  matches: BracketMatch[];
  predictions: Record<number, { home: number; away: number }>;
  onPredict: (matchId: number, home: number, away: number) => void;
}) {
  const rounds = ["octavos", "cuartos", "semi", "final"];

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 min-h-[500px] items-start">
      {rounds.map((round) => {
        const roundMatches = matches.filter((m) => m.round === round);
        const gap = round === "octavos" ? "gap-3" : round === "cuartos" ? "gap-8" : round === "semi" ? "gap-20" : "gap-0";
        const mt = round === "octavos" ? "mt-0" : round === "cuartos" ? "mt-5" : round === "semi" ? "mt-14" : "mt-28";

        return (
          <div key={round} className="flex flex-col items-center flex-shrink-0" style={{ width: 190 }}>
            <span className="font-grotesk font-semibold text-[10px] text-teal uppercase tracking-wider mb-3">
              {ROUND_SHORT[round]}
            </span>

            <div className={`flex flex-col ${gap} ${mt}`}>
              {roundMatches.map((match) => (
                <div key={match.id} className="relative">
                  <BracketMatchCard
                    match={match}
                    prediction={predictions[match.id]}
                    onPredict={onPredict}
                  />
                  {round !== "final" && (
                    <div className="absolute top-1/2 -right-4 w-4 h-px bg-border" />
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function BracketView() {
  const [predictions, setPredictions] = useState<Record<number, { home: number; away: number }>>({});

  function handlePredict(matchId: number, home: number, away: number) {
    setPredictions((prev) => ({ ...prev, [matchId]: { home, away } }));
  }

  return (
    <div>
      <div className="md:hidden">
        <MobileBracket matches={INITIAL_KNOCKOUT} predictions={predictions} onPredict={handlePredict} />
      </div>
      <div className="hidden md:block">
        <DesktopBracket matches={INITIAL_KNOCKOUT} predictions={predictions} onPredict={handlePredict} />
      </div>
    </div>
  );
}
