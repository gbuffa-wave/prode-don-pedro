"use client";

import { useState, useEffect } from "react";
import { Trophy, Check, X } from "@phosphor-icons/react";
import { createClient } from "@/lib/supabase/client";
import type { Team } from "@/lib/types";

export default function AdminChampionPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [champion, setChampion] = useState<{ name: string; code: string } | null>(null);
  const [selected, setSelected] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: teamsData } = await supabase.from("teams").select("*").order("name");
      if (teamsData) setTeams(teamsData);

      const res = await fetch("/api/admin/champion");
      const { champion: champ } = await res.json();
      if (champ) {
        setChampion(champ);
        setSelected(teamsData?.find(t => t.code === champ.code) || null);
      }
      setLoading(false);
    }
    load();
  }, []);

  async function handleSave() {
    if (!selected) return;
    setSaving(true);
    await fetch("/api/admin/champion", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ champion: { name: selected.name, code: selected.code } }),
    });
    setChampion({ name: selected.name, code: selected.code });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function handleClear() {
    setSaving(true);
    await fetch("/api/admin/champion", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ champion: null }),
    });
    setChampion(null);
    setSelected(null);
    setSaving(false);
  }

  if (loading) return <div className="text-center py-12"><p className="text-text-muted text-sm">Cargando...</p></div>;

  return (
    <div>
      <h2 className="font-sora font-bold text-lg mb-4">Campeón del Mundial</h2>
      <p className="text-text-secondary text-sm mb-6">
        Selecciona al campeón del Mundial 2026. Se mostrará destacado en la sección de llaves.
      </p>

      {/* Current champion */}
      {champion && (
        <div className="bg-gold/5 border border-gold/30 rounded-lg p-4 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Trophy size={20} weight="fill" className="text-gold" />
            <div className="flex items-center gap-2">
              <img src={`https://flagcdn.com/w80/${teams.find(t => t.code === champion.code)?.flag_url.split('/').pop()}`} alt="" className="w-8 h-5 object-cover rounded-lg" />
              <span className="font-sora font-bold text-gold">{champion.name}</span>
            </div>
            <span className="text-[10px] text-gold/60 font-medium">★ Campeón actual ★</span>
          </div>
          <button
            onClick={handleClear}
            disabled={saving}
            className="flex items-center gap-1 px-3 py-1.5 text-xs text-danger hover:bg-danger/10 rounded transition-colors"
          >
            <X size={12} weight="bold" />
            Quitar
          </button>
        </div>
      )}

      {/* Team selector */}
      <p className="font-grotesk font-semibold text-xs text-text-muted uppercase tracking-wider mb-3">
        {champion ? "Cambiar campeón" : "Seleccionar campeón"}
      </p>

      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 mb-6">
        {teams.map((team) => (
          <button
            key={team.id}
            onClick={() => setSelected(team)}
            className={`flex flex-col items-center gap-1.5 p-2.5 rounded-lg transition-all ${
              selected?.id === team.id
                ? "bg-gold/15 border-2 border-gold"
                : "bg-surface border-2 border-transparent hover:border-border"
            }`}
          >
            <img src={team.flag_url} alt="" className="w-10 h-6 object-cover rounded-lg" />
            <span className={`text-[10px] font-medium ${selected?.id === team.id ? "text-gold" : "text-text-secondary"}`}>
              {team.code}
            </span>
          </button>
        ))}
      </div>

      {selected && (
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <img src={selected.flag_url} alt="" className="w-8 h-5 object-cover rounded-lg" />
            <span className="font-grotesk font-medium text-sm">{selected.name}</span>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className={`flex items-center gap-1.5 px-5 py-2.5 text-sm font-semibold rounded transition-all ${
              saved ? "bg-success text-bg" : "bg-gold text-bg hover:brightness-110"
            }`}
          >
            {saved ? (
              <><Check size={14} weight="bold" /> Guardado</>
            ) : saving ? "Guardando..." : (
              <><Trophy size={14} weight="fill" /> Declarar campeón</>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
