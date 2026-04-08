"use client";

import { useState } from "react";

interface Props {
  matchId: number;
  existingHome?: number;
  existingAway?: number;
  disabled?: boolean;
  onSubmit: (matchId: number, homeScore: number, awayScore: number) => void;
}

export default function PredictionForm({ matchId, existingHome, existingAway, disabled, onSubmit }: Props) {
  const [home, setHome] = useState(existingHome?.toString() ?? "");
  const [away, setAway] = useState(existingAway?.toString() ?? "");

  const hasExisting = existingHome !== undefined;

  function handleSubmit() {
    const h = parseInt(home);
    const a = parseInt(away);
    if (isNaN(h) || isNaN(a) || h < 0 || a < 0) return;
    onSubmit(matchId, h, a);
  }

  return (
    <div className="flex items-center gap-2">
      <input
        type="number"
        min={0}
        max={20}
        value={home}
        onChange={(e) => setHome(e.target.value)}
        disabled={disabled}
        className="w-10 h-10 text-center font-sora font-bold text-lg bg-surface border border-border rounded focus:border-teal focus:outline-none disabled:opacity-40 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        placeholder="-"
      />
      <span className="text-text-muted text-xs">-</span>
      <input
        type="number"
        min={0}
        max={20}
        value={away}
        onChange={(e) => setAway(e.target.value)}
        disabled={disabled}
        className="w-10 h-10 text-center font-sora font-bold text-lg bg-surface border border-border rounded focus:border-teal focus:outline-none disabled:opacity-40 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        placeholder="-"
      />
      {!disabled && (
        <button
          onClick={handleSubmit}
          disabled={!home || !away}
          className="ml-1 px-3 py-2 text-xs font-semibold bg-teal text-bg rounded hover:bg-teal-dim transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          {hasExisting ? "Editar" : "OK"}
        </button>
      )}
    </div>
  );
}
