"use client";

import { useState } from "react";
import { Check } from "@phosphor-icons/react";
import type { ScoringRule } from "@/lib/types";

const INITIAL_RULES: ScoringRule[] = [
  { id: 1, rule_type: "exact", label: "Resultado exacto", points: 10, is_active: true },
  { id: 2, rule_type: "winner_and_diff", label: "Ganador + diferencia de goles", points: 5, is_active: true },
  { id: 3, rule_type: "winner_only", label: "Solo ganador", points: 3, is_active: true },
];

export default function AdminScoringPage() {
  const [rules, setRules] = useState(INITIAL_RULES);
  const [saved, setSaved] = useState(false);

  function updatePoints(id: number, points: number) {
    setRules((prev) => prev.map((r) => r.id === id ? { ...r, points } : r));
  }

  function toggleActive(id: number) {
    setRules((prev) => prev.map((r) => r.id === id ? { ...r, is_active: !r.is_active } : r));
  }

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  // Preview: simulate a match
  const activeRules = rules.filter((r) => r.is_active);

  return (
    <div>
      <h2 className="font-sora font-bold text-lg mb-4">Configurar Puntaje</h2>

      <div className="space-y-3 mb-6">
        {rules.map((rule) => (
          <div key={rule.id} className="bg-surface border border-border rounded-lg p-4 flex items-center gap-4">
            <button
              onClick={() => toggleActive(rule.id)}
              className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                rule.is_active ? "bg-teal border-teal" : "border-border"
              }`}
            >
              {rule.is_active && <Check size={12} weight="bold" className="text-bg" />}
            </button>
            <div className="flex-1">
              <p className={`font-grotesk text-sm font-medium ${rule.is_active ? "text-text-primary" : "text-text-muted line-through"}`}>
                {rule.label}
              </p>
              <p className="text-[10px] text-text-muted mt-0.5">
                {rule.rule_type === "exact" && "El jugador acierta el resultado exacto (ej: 2-1)"}
                {rule.rule_type === "winner_and_diff" && "Acierta ganador y diferencia de goles (ej: predijo 3-1, fue 2-0)"}
                {rule.rule_type === "winner_only" && "Solo acierta quien gana o si es empate"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number" min={0} max={100}
                value={rule.points}
                onChange={(e) => updatePoints(rule.id, parseInt(e.target.value) || 0)}
                disabled={!rule.is_active}
                className="w-16 h-10 text-center font-sora font-bold bg-bg border border-border rounded focus:border-teal focus:outline-none disabled:opacity-40 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <span className="text-xs text-text-muted">pts</span>
            </div>
          </div>
        ))}
      </div>

      {/* Preview */}
      <div className="bg-surface-raised border border-border rounded-lg p-4 mb-6">
        <p className="font-grotesk font-semibold text-xs text-text-muted uppercase tracking-wider mb-3">Vista previa</p>
        <p className="text-xs text-text-secondary mb-2">Si el resultado real es <span className="text-teal font-semibold">2 - 1</span>:</p>
        <div className="space-y-1.5">
          {activeRules.map((r) => (
            <div key={r.id} className="flex items-center justify-between text-xs">
              <span className="text-text-secondary">
                {r.rule_type === "exact" && "Predijo 2 - 1"}
                {r.rule_type === "winner_and_diff" && "Predijo 3 - 2"}
                {r.rule_type === "winner_only" && "Predijo 1 - 0"}
              </span>
              <span className="font-sora font-bold text-teal">+{r.points} pts</span>
            </div>
          ))}
          <div className="flex items-center justify-between text-xs pt-1 border-t border-border">
            <span className="text-text-secondary">Predijo 0 - 2 (errado)</span>
            <span className="font-sora font-bold text-text-muted">0 pts</span>
          </div>
        </div>
      </div>

      <button
        onClick={handleSave}
        className={`px-6 py-3 text-sm font-semibold rounded transition-all ${
          saved ? "bg-success text-bg" : "bg-teal text-bg hover:bg-teal-dim"
        }`}
      >
        {saved ? <span className="flex items-center gap-1"><Check size={14} weight="bold" /> Guardado</span> : "Guardar configuracion"}
      </button>
    </div>
  );
}
