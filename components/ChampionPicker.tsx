"use client";

import { useState, useEffect, useCallback } from "react";
import { Trophy, Lock, Check } from "@phosphor-icons/react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { useToast } from "@/components/Toast";
import { createClient } from "@/lib/supabase/client";
import type { Team } from "@/lib/types";

interface Props {
  teams: Team[];
}

export default function ChampionPicker({ teams }: Props) {
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [open, setOpen] = useState(false);
  const [championPoints, setChampionPoints] = useState(50);
  const { showToast } = useToast();

  useEffect(() => {
    const supabase = createClient();
    supabase.from("scoring_rules").select("points").eq("rule_type", "champion").eq("is_active", true).single().then(({ data }) => {
      if (data) setChampionPoints(data.points);
    });
  }, []);

  // Check if tournament has started (June 11, 2026)
  const tournamentStarted = new Date() >= new Date("2026-06-11T17:00:00Z");

  const fireChampionConfetti = useCallback(() => {
    const colors = ["#D4A853", "#FFD700", "#0c5cac", "#ffffff"];
    confetti({ particleCount: 60, spread: 70, origin: { x: 0.3, y: 0.6 }, colors, shapes: ["star"], scalar: 1.5 });
    confetti({ particleCount: 60, spread: 70, origin: { x: 0.7, y: 0.6 }, colors, shapes: ["star"], scalar: 1.5 });
    setTimeout(() => {
      confetti({ particleCount: 40, spread: 100, origin: { x: 0.5, y: 0.5 }, colors, scalar: 1.2 });
    }, 300);
  }, []);

  function handleConfirm() {
    if (!selectedTeam) return;
    setConfirmed(true);
    showToast(`¡${selectedTeam.name} como campeón! +{championPoints} pts si acertás`);
    fireChampionConfetti();
  }

  if (teams.length === 0) return null;

  return (
    <div className="mb-6">
      <div className={`bg-surface border rounded-lg overflow-hidden ${confirmed ? "border-gold/30" : "border-border"}`}>
        {/* Header */}
        <button
          onClick={() => !confirmed && setOpen(!open)}
          className="w-full px-4 py-3 flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <Trophy size={18} weight="fill" className="text-gold" />
            <span className="font-sora font-bold text-sm">
              {confirmed ? "Tu campeón" : "¿Quién sale campeón?"}
            </span>
            <span className="text-[10px] text-gold font-semibold bg-gold/10 px-2 py-0.5 rounded-full">
              +{championPoints} pts
            </span>
          </div>

          {confirmed && selectedTeam ? (
            <div className="flex items-center gap-2">
              <img src={selectedTeam.flag_url} alt="" className="w-6 h-4 object-cover rounded-sm" />
              <span className="font-grotesk font-semibold text-sm text-gold">{selectedTeam.name}</span>
              <Lock size={12} className="text-text-muted" />
            </div>
          ) : tournamentStarted ? (
            <div className="flex items-center gap-1 text-text-muted">
              <Lock size={12} />
              <span className="text-[10px]">Cerrado</span>
            </div>
          ) : (
            <span className="text-[10px] text-text-muted">
              {open ? "Cerrar" : "Elegir"}
            </span>
          )}
        </button>

        {/* Team selector */}
        <AnimatePresence>
          {open && !confirmed && !tournamentStarted && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4 border-t border-border pt-3">
                <p className="text-[10px] text-text-muted mb-3">
                  Elegí al campeón del Mundial antes de que comience. Una vez confirmado no se puede cambiar.
                </p>

                <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5 max-h-[200px] overflow-y-auto mb-3">
                  {teams.map((team) => (
                    <button
                      key={team.id}
                      onClick={() => setSelectedTeam(team)}
                      className={`flex flex-col items-center gap-1 p-2 rounded transition-colors ${
                        selectedTeam?.id === team.id
                          ? "bg-teal/15 border border-teal"
                          : "bg-bg border border-transparent hover:border-border"
                      }`}
                    >
                      <img src={team.flag_url} alt="" className="w-8 h-5 object-cover rounded-sm" />
                      <span className="text-[9px] text-text-secondary truncate w-full text-center">
                        {team.code}
                      </span>
                    </button>
                  ))}
                </div>

                {selectedTeam && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <img src={selectedTeam.flag_url} alt="" className="w-6 h-4 object-cover rounded-sm" />
                      <span className="font-grotesk font-medium text-sm">{selectedTeam.name}</span>
                    </div>
                    <button
                      onClick={handleConfirm}
                      className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-gold text-bg rounded hover:brightness-110 transition-all"
                    >
                      <Check size={14} weight="bold" />
                      Confirmar campeón
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
