"use client";

import { useState, useEffect } from "react";
import { Target, CaretDown, CaretUp } from "@phosphor-icons/react";
import { createClient } from "@/lib/supabase/client";

interface Rule {
  label: string;
  example: string;
  points: number;
  color: string;
}

export default function ScoringInfo() {
  const [open, setOpen] = useState(false);
  const [rules, setRules] = useState<Rule[]>([]);

  useEffect(() => {
    const supabase = createClient();
    supabase.from("scoring_rules").select("*").eq("is_active", true).order("id").then(({ data }) => {
      if (!data) return;
      const mapped: Rule[] = [];
      for (const r of data) {
        if (r.rule_type === "exact") mapped.push({ label: "Resultado exacto", example: "Predecís 2-1 y sale 2-1", points: r.points, color: "text-gold" });
        if (r.rule_type === "winner_and_diff") mapped.push({ label: "Ganador + diferencia de goles", example: "Predecís 3-1 y sale 2-0", points: r.points, color: "text-teal" });
        if (r.rule_type === "winner_only") mapped.push({ label: "Solo ganador", example: "Predecís 1-0 y sale 3-2", points: r.points, color: "text-text-primary" });
        if (r.rule_type === "champion") mapped.push({ label: "Campeón del Mundial", example: "Acertar quién gana el torneo", points: r.points, color: "text-gold" });
      }
      mapped.push({ label: "Error", example: "Predecís 1-0 y sale 0-1", points: 0, color: "text-text-muted" });
      setRules(mapped);
    });
  }, []);

  const championRule = rules.find(r => r.label === "Campeón del Mundial");
  const matchRules = rules.filter(r => r.label !== "Campeón del Mundial");

  return (
    <div className="mb-6">
      <div className="bg-surface border border-border rounded-lg overflow-hidden">
        <button
          onClick={() => setOpen(!open)}
          className="w-full px-4 py-3 flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <Target size={18} weight="fill" className="text-teal" />
            <span className="font-sora font-bold text-sm">¿Cómo se puntúa?</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1.5">
              {rules.filter(r => r.points > 0).map((r) => (
                <span key={r.label} className={`text-[10px] font-semibold ${r.color} bg-surface-raised px-2 py-0.5 rounded-full`}>
                  +{r.points}
                </span>
              ))}
            </div>
            {open ? <CaretUp size={14} className="text-text-muted" /> : <CaretDown size={14} className="text-text-muted" />}
          </div>
        </button>

        {open && (
          <div className="px-4 pb-4 border-t border-border pt-3 space-y-2.5">
            {matchRules.map((rule) => (
              <div key={rule.label} className="flex items-center justify-between">
                <div className="flex-1">
                  <p className={`font-grotesk text-sm font-medium ${rule.points > 0 ? "text-text-primary" : "text-text-muted"}`}>
                    {rule.label}
                  </p>
                  <p className="text-[10px] text-text-muted">{rule.example}</p>
                </div>
                <span className={`font-sora font-bold text-sm ${rule.color} ml-4`}>
                  {rule.points > 0 ? `+${rule.points}` : "0"} pts
                </span>
              </div>
            ))}
            {championRule && (
              <div className="pt-2 border-t border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-grotesk text-sm font-medium text-gold">{championRule.label}</p>
                    <p className="text-[10px] text-text-muted">{championRule.example}</p>
                  </div>
                  <span className="font-sora font-bold text-sm text-gold ml-4">+{championRule.points} pts</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
