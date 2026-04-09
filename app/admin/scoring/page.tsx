"use client";

import { useState, useEffect } from "react";
import { Check } from "@phosphor-icons/react";
import { createClient } from "@/lib/supabase/client";
import type { ScoringRule } from "@/lib/types";

export default function AdminScoringPage() {
  const [rules, setRules] = useState<ScoringRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("scoring_rules")
      .select("*")
      .order("id")
      .then(({ data }) => {
        if (data) setRules(data);
        setLoading(false);
      });
  }, []);

  function updatePoints(id: number, points: number) {
    setRules((prev) => prev.map((r) => r.id === id ? { ...r, points } : r));
  }

  function toggleActive(id: number) {
    setRules((prev) => prev.map((r) => r.id === id ? { ...r, is_active: !r.is_active } : r));
  }

  async function handleSave() {
    setSaving(true);
    await fetch("/api/admin/scoring", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rules }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  // Preview: simulate a match
  const activeRules = rules.filter((r) => r.is_active);

  if (loading) {
    return <div className="text-text-muted text-sm">Cargando reglas...</div>;
  }

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
                {rule.rule_type === "champion" && "Acertar qué selección gana el Mundial (se otorga al finalizar el torneo)"}
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
                {r.rule_type === "champion" && "Acertó el campeón"}
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
        disabled={saving}
        className={`px-6 py-3 text-sm font-semibold rounded transition-all ${
          saved ? "bg-success text-bg" : "bg-teal text-bg hover:bg-teal-dim"
        } disabled:opacity-60`}
      >
        {saved ? <span className="flex items-center gap-1"><Check size={14} weight="bold" /> Guardado</span> : saving ? "Guardando..." : "Guardar configuracion"}
      </button>
    </div>
  );
}
