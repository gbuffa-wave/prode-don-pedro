"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { getFlagUrl } from "@/lib/fixture-data";

interface BracketMatch {
  id: number;
  round: string;
  position: number;
  side: "left" | "right";
  home: { name: string; code: string } | null;
  away: { name: string; code: string } | null;
  home_score: number | null;
  away_score: number | null;
  status: "scheduled" | "in_progress" | "finished";
}

const INITIAL_KNOCKOUT: BracketMatch[] = [
  // LEFT — Octavos
  { id: 101, round: "octavos", position: 1, side: "left", home: { name: "Estados Unidos", code: "USA" }, away: { name: "Colombia", code: "COL" }, home_score: null, away_score: null, status: "scheduled" },
  { id: 102, round: "octavos", position: 2, side: "left", home: { name: "Argentina", code: "ARG" }, away: { name: "Japon", code: "JPN" }, home_score: null, away_score: null, status: "scheduled" },
  { id: 103, round: "octavos", position: 3, side: "left", home: { name: "Francia", code: "FRA" }, away: { name: "Corea del Sur", code: "KOR" }, home_score: null, away_score: null, status: "scheduled" },
  { id: 104, round: "octavos", position: 4, side: "left", home: { name: "Brasil", code: "BRA" }, away: { name: "Senegal", code: "SEN" }, home_score: null, away_score: null, status: "scheduled" },
  // RIGHT — Octavos
  { id: 105, round: "octavos", position: 1, side: "right", home: { name: "Alemania", code: "GER" }, away: { name: "Marruecos", code: "MAR" }, home_score: null, away_score: null, status: "scheduled" },
  { id: 106, round: "octavos", position: 2, side: "right", home: { name: "Espana", code: "ESP" }, away: { name: "Chile", code: "CHI" }, home_score: null, away_score: null, status: "scheduled" },
  { id: 107, round: "octavos", position: 3, side: "right", home: { name: "Inglaterra", code: "ENG" }, away: { name: "Uruguay", code: "URU" }, home_score: null, away_score: null, status: "scheduled" },
  { id: 108, round: "octavos", position: 4, side: "right", home: { name: "Portugal", code: "POR" }, away: { name: "Croacia", code: "CRO" }, home_score: null, away_score: null, status: "scheduled" },
  // LEFT — Cuartos
  { id: 201, round: "cuartos", position: 1, side: "left", home: null, away: null, home_score: null, away_score: null, status: "scheduled" },
  { id: 202, round: "cuartos", position: 2, side: "left", home: null, away: null, home_score: null, away_score: null, status: "scheduled" },
  // RIGHT — Cuartos
  { id: 203, round: "cuartos", position: 1, side: "right", home: null, away: null, home_score: null, away_score: null, status: "scheduled" },
  { id: 204, round: "cuartos", position: 2, side: "right", home: null, away: null, home_score: null, away_score: null, status: "scheduled" },
  // LEFT — Semi
  { id: 301, round: "semi", position: 1, side: "left", home: null, away: null, home_score: null, away_score: null, status: "scheduled" },
  // RIGHT — Semi
  { id: 302, round: "semi", position: 1, side: "right", home: null, away: null, home_score: null, away_score: null, status: "scheduled" },
  // Final
  { id: 401, round: "final", position: 1, side: "left", home: null, away: null, home_score: null, away_score: null, status: "scheduled" },
  // 3rd place
  { id: 402, round: "tercero", position: 1, side: "left", home: null, away: null, home_score: null, away_score: null, status: "scheduled" },
];

// ─── Team Badge: flag rectangle + name below ───
function TeamBadge({ team, score, isWinner }: {
  team: { name: string; code: string } | null;
  score: number | null;
  isWinner?: boolean;
}) {
  if (!team) {
    return (
      <div className="flex flex-col items-center w-[52px]">
        <div className="w-[52px] h-[34px] rounded-lg bg-border/30 border border-border/50" />
        <span className="text-[8px] text-text-muted mt-1">TBD</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center w-[52px]">
      <div className={`relative w-[52px] h-[34px] rounded-lg overflow-hidden border-2 transition-colors ${
        isWinner ? "border-teal shadow-[0_0_8px_rgba(12,92,172,0.3)]" : "border-border/50"
      }`}>
        <img src={getFlagUrl(team.code)} alt={team.code} className="w-full h-full object-cover" />
        {score !== null && (
          <div className={`absolute bottom-0 right-0 px-1.5 py-0.5 text-[10px] font-sora font-bold ${
            isWinner ? "bg-teal text-bg" : "bg-bg/80 text-text-primary"
          }`}>
            {score}
          </div>
        )}
      </div>
      <span className={`text-[9px] font-medium mt-1 text-center leading-tight ${
        isWinner ? "text-teal font-semibold" : "text-text-secondary"
      }`}>
        {team.code}
      </span>
    </div>
  );
}

// ─── Match: two team badges with VS ───
function MatchSlot({ match }: { match: BracketMatch }) {
  const homeWins = match.status === "finished" && match.home_score !== null && match.away_score !== null && match.home_score > match.away_score;
  const awayWins = match.status === "finished" && match.home_score !== null && match.away_score !== null && match.away_score > match.home_score;

  return (
    <div className="flex items-center gap-1">
      <TeamBadge team={match.home} score={match.home_score} isWinner={homeWins} />
      <span className="text-[9px] text-text-muted font-bold">vs</span>
      <TeamBadge team={match.away} score={match.away_score} isWinner={awayWins} />
    </div>
  );
}

// ─── Connector Lines ───
function Connector({ direction, height }: { direction: "right" | "left"; height: number }) {
  const w = 16;
  return (
    <svg width={w} height={height} className="flex-shrink-0" style={{ minWidth: w }}>
      {direction === "right" ? (
        <>
          <line x1="0" y1={height * 0.25} x2={w / 2} y2={height * 0.25} stroke="#333" strokeWidth="1.5" />
          <line x1="0" y1={height * 0.75} x2={w / 2} y2={height * 0.75} stroke="#333" strokeWidth="1.5" />
          <line x1={w / 2} y1={height * 0.25} x2={w / 2} y2={height * 0.75} stroke="#333" strokeWidth="1.5" />
          <line x1={w / 2} y1={height * 0.5} x2={w} y2={height * 0.5} stroke="#333" strokeWidth="1.5" />
        </>
      ) : (
        <>
          <line x1={w} y1={height * 0.25} x2={w / 2} y2={height * 0.25} stroke="#333" strokeWidth="1.5" />
          <line x1={w} y1={height * 0.75} x2={w / 2} y2={height * 0.75} stroke="#333" strokeWidth="1.5" />
          <line x1={w / 2} y1={height * 0.25} x2={w / 2} y2={height * 0.75} stroke="#333" strokeWidth="1.5" />
          <line x1={w / 2} y1={height * 0.5} x2={0} y2={height * 0.5} stroke="#333" strokeWidth="1.5" />
        </>
      )}
    </svg>
  );
}

// ─── Champion Spotlight ───
function ChampionSpot({ champion }: { champion: { name: string; code: string } | null }) {

  return (
    <div className="mb-4">
      {champion ? (
        <div className="flex flex-col items-center">
          <p className="text-[9px] text-gold font-semibold uppercase tracking-widest mb-2">Campeón del Mundo</p>
          <div className="relative">
            <div className="absolute -inset-2 rounded-2xl bg-gold/10 animate-pulse" />
            <div className="relative w-[72px] h-[48px] rounded-xl overflow-hidden border-3 border-gold shadow-[0_0_20px_rgba(212,168,83,0.4)]">
              <img src={getFlagUrl(champion.code)} alt={champion.code} className="w-full h-full object-cover" />
            </div>
          </div>
          <span className="font-sora font-bold text-sm text-gold mt-2">{champion.name}</span>
          <div className="flex items-center gap-1 mt-1">
            <span className="text-[9px] text-gold/60">★</span>
            <span className="text-[9px] text-gold/80 font-medium">Campeón 2026</span>
            <span className="text-[9px] text-gold/60">★</span>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <p className="text-[9px] text-text-muted uppercase tracking-widest mb-2">Campeón del Mundo</p>
          <div className="w-[72px] h-[48px] rounded-xl border-2 border-dashed border-gold/30 bg-gold/5 flex items-center justify-center">
            <span className="text-gold/40 text-lg">?</span>
          </div>
          <span className="text-[10px] text-text-muted mt-1.5">Por definir</span>
        </div>
      )}
    </div>
  );
}

// ─── Desktop Bracket ───
function DesktopBracket({ matches, champion }: { matches: BracketMatch[]; champion: { name: string; code: string } | null }) {
  const left = {
    octavos: matches.filter(m => m.round === "octavos" && m.side === "left"),
    cuartos: matches.filter(m => m.round === "cuartos" && m.side === "left"),
    semi: matches.filter(m => m.round === "semi" && m.side === "left"),
  };
  const right = {
    octavos: matches.filter(m => m.round === "octavos" && m.side === "right"),
    cuartos: matches.filter(m => m.round === "cuartos" && m.side === "right"),
    semi: matches.filter(m => m.round === "semi" && m.side === "right"),
  };
  const final_ = matches.find(m => m.round === "final");
  const tercero = matches.find(m => m.round === "tercero");

  return (
    <div className="overflow-x-auto pb-4">
      <div className="min-w-[960px]">
        {/* Round labels */}
        <div className="grid grid-cols-7 gap-0 mb-3">
          {["Octavos", "Cuartos", "Semi", "Final", "Semi", "Cuartos", "Octavos"].map((label, i) => (
            <p key={i} className={`text-[10px] font-semibold uppercase tracking-wider text-center ${
              label === "Final" ? "text-gold" : "text-teal"
            }`}>
              {label}
            </p>
          ))}
        </div>

        {/* Bracket body */}
        <div className="flex items-stretch" style={{ minHeight: 480 }}>
          {/* LEFT: Octavos */}
          <div className="flex flex-col justify-around py-1 flex-shrink-0">
            {left.octavos.map(m => <MatchSlot key={m.id} match={m} />)}
          </div>

          <div className="flex flex-col justify-around py-1 flex-shrink-0">
            <Connector direction="right" height={110} />
            <Connector direction="right" height={110} />
          </div>

          {/* LEFT: Cuartos */}
          <div className="flex flex-col justify-around py-10 flex-shrink-0">
            {left.cuartos.map(m => <MatchSlot key={m.id} match={m} />)}
          </div>

          <div className="flex flex-col justify-center flex-shrink-0">
            <Connector direction="right" height={200} />
          </div>

          {/* LEFT: Semi */}
          <div className="flex flex-col justify-center flex-shrink-0">
            {left.semi.map(m => <MatchSlot key={m.id} match={m} />)}
          </div>

          <div className="flex items-center flex-shrink-0">
            <div className="w-4 h-px bg-[#333]" />
          </div>

          {/* CENTER: Champion + Copa + Final */}
          <div className="flex flex-col items-center justify-center mx-3 flex-shrink-0">
            {/* Champion spotlight */}
            <ChampionSpot champion={champion} />

            {/* Copa */}
            <Image src="/copa-mundial.png" alt="Copa del Mundo" width={50} height={96} className="h-[70px] w-auto object-contain drop-shadow-[0_0_12px_rgba(212,168,83,0.4)] mb-2" />
            <p className="text-[10px] text-gold font-sora font-bold uppercase tracking-wider mb-2">Final</p>
            {final_ && <MatchSlot match={final_} />}
            {tercero && (
              <div className="mt-4">
                <p className="text-[9px] text-text-muted text-center mb-1.5">3er y 4to puesto</p>
                <MatchSlot match={tercero} />
              </div>
            )}
          </div>

          <div className="flex items-center flex-shrink-0">
            <div className="w-4 h-px bg-[#333]" />
          </div>

          {/* RIGHT: Semi */}
          <div className="flex flex-col justify-center flex-shrink-0">
            {right.semi.map(m => <MatchSlot key={m.id} match={m} />)}
          </div>

          <div className="flex flex-col justify-center flex-shrink-0">
            <Connector direction="left" height={200} />
          </div>

          {/* RIGHT: Cuartos */}
          <div className="flex flex-col justify-around py-10 flex-shrink-0">
            {right.cuartos.map(m => <MatchSlot key={m.id} match={m} />)}
          </div>

          <div className="flex flex-col justify-around py-1 flex-shrink-0">
            <Connector direction="left" height={110} />
            <Connector direction="left" height={110} />
          </div>

          {/* RIGHT: Octavos */}
          <div className="flex flex-col justify-around py-1 flex-shrink-0">
            {right.octavos.map(m => <MatchSlot key={m.id} match={m} />)}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Mobile Bracket ───
function MobileBracket({ matches, champion }: { matches: BracketMatch[]; champion: { name: string; code: string } | null }) {
  const rounds = ["octavos", "cuartos", "semi", "final", "tercero"];
  const labels: Record<string, string> = {
    octavos: "Octavos de final",
    cuartos: "Cuartos de final",
    semi: "Semifinales",
    final: "Final",
    tercero: "3er y 4to puesto",
  };

  return (
    <div className="space-y-6">
      {/* Champion spot mobile */}
      <div className="flex justify-center pb-2">
        <ChampionSpot champion={champion} />
      </div>

      {rounds.map((round) => {
        const roundMatches = matches.filter(m => m.round === round);
        if (roundMatches.length === 0) return null;
        const isFinale = round === "final";
        return (
          <div key={round}>
            <div className="flex items-center gap-3 mb-3">
              {isFinale && (
                <Image src="/copa-mundial.png" alt="" width={20} height={38} className="h-[24px] w-auto object-contain" />
              )}
              <span className={`font-grotesk font-semibold text-xs uppercase tracking-wider ${isFinale ? "text-gold" : "text-teal"}`}>
                {labels[round]}
              </span>
              <div className="flex-1 h-px bg-border" />
            </div>
            <div className={`grid gap-3 ${roundMatches.length > 1 ? "grid-cols-2" : "grid-cols-1 max-w-[200px] mx-auto"}`}>
              {roundMatches.map(m => (
                <div key={m.id} className="flex justify-center">
                  <MatchSlot match={m} />
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Main Export ───
export default function BracketView() {
  const [champion, setChampion] = useState<{ name: string; code: string } | null>(null);

  useEffect(() => {
    fetch("/api/admin/champion")
      .then(res => res.json())
      .then(data => setChampion(data.champion))
      .catch(() => {});
  }, []);

  return (
    <div>
      <div className="md:hidden">
        <MobileBracket matches={INITIAL_KNOCKOUT} champion={champion} />
      </div>
      <div className="hidden md:block">
        <DesktopBracket matches={INITIAL_KNOCKOUT} champion={champion} />
      </div>
    </div>
  );
}
