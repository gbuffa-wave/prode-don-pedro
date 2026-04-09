"use client";

import { useState, useEffect } from "react";
import { Plus, Trash, Check, PencilSimple, FilmSlate, Megaphone, MicrophoneStage, Tree, Moon, Sun, Lighthouse, Compass, Star, SoccerBall, Heart, Lightning, Fire, Flame, ShieldStar, Flag, Crown, Rocket, Diamond, Flower } from "@phosphor-icons/react";
import type { IconProps } from "@phosphor-icons/react";

interface InternalTeam {
  id: number;
  name: string;
  icon: string;
  created_at: string;
}

const ICON_OPTIONS: { name: string; icon: React.ComponentType<IconProps> }[] = [
  { name: "FilmSlate", icon: FilmSlate },
  { name: "Megaphone", icon: Megaphone },
  { name: "MicrophoneStage", icon: MicrophoneStage },
  { name: "Tree", icon: Tree },
  { name: "Moon", icon: Moon },
  { name: "Sun", icon: Sun },
  { name: "Lighthouse", icon: Lighthouse },
  { name: "Compass", icon: Compass },
  { name: "Star", icon: Star },
  { name: "SoccerBall", icon: SoccerBall },
  { name: "Heart", icon: Heart },
  { name: "Lightning", icon: Lightning },
  { name: "Fire", icon: Fire },
  { name: "ShieldStar", icon: ShieldStar },
  { name: "Flag", icon: Flag },
  { name: "Crown", icon: Crown },
  { name: "Rocket", icon: Rocket },
  { name: "Diamond", icon: Diamond },
  { name: "Flower", icon: Flower },
];

function getIconComponent(iconName: string) {
  return ICON_OPTIONS.find(i => i.name === iconName)?.icon || SoccerBall;
}

export default function AdminTeamsPage() {
  const [teams, setTeams] = useState<InternalTeam[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [newIcon, setNewIcon] = useState("SoccerBall");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editIcon, setEditIcon] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/teams")
      .then(res => res.json())
      .then(data => { setTeams(data.teams || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  async function handleAdd() {
    if (!newName.trim()) return;
    setSaving(true);
    const res = await fetch("/api/admin/teams", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName.trim(), icon: newIcon }),
    });
    if (res.ok) {
      // Refresh
      const data = await fetch("/api/admin/teams").then(r => r.json());
      setTeams(data.teams || []);
      setNewName("");
      setNewIcon("SoccerBall");
    }
    setSaving(false);
  }

  async function handleUpdate(id: number) {
    if (!editName.trim()) return;
    await fetch("/api/admin/teams", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, name: editName.trim(), icon: editIcon }),
    });
    setTeams(prev => prev.map(t => t.id === id ? { ...t, name: editName.trim(), icon: editIcon } : t));
    setEditingId(null);
  }

  async function handleDelete(id: number, name: string) {
    if (!confirm(`¿Eliminar equipo "${name}"? Los usuarios asignados quedarán sin equipo.`)) return;
    await fetch("/api/admin/teams", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setTeams(prev => prev.filter(t => t.id !== id));
  }

  if (loading) return <div className="text-center py-12"><p className="text-text-muted text-sm">Cargando equipos...</p></div>;

  return (
    <div>
      <h2 className="font-sora font-bold text-lg mb-4">Equipos</h2>
      <p className="text-text-secondary text-sm mb-6">Administrá los equipos internos. Los usuarios eligen su equipo al registrarse.</p>

      {/* Team list */}
      <div className="space-y-2 mb-6">
        {teams.map((team) => {
          const Icon = getIconComponent(team.icon);
          const isEditing = editingId === team.id;

          return (
            <div key={team.id} className="bg-surface border border-border rounded-lg p-3 flex items-center gap-3">
              {isEditing ? (
                <>
                  {/* Icon picker */}
                  <div className="flex gap-1 flex-wrap max-w-[200px]">
                    {ICON_OPTIONS.slice(0, 12).map(({ name, icon: OptIcon }) => (
                      <button
                        key={name}
                        onClick={() => setEditIcon(name)}
                        className={`p-1.5 rounded ${editIcon === name ? "bg-teal/15 text-teal" : "text-text-muted hover:text-text-primary"}`}
                      >
                        <OptIcon size={14} weight={editIcon === name ? "fill" : "regular"} />
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="flex-1 bg-bg border border-border rounded px-3 py-1.5 text-sm focus:border-teal focus:outline-none"
                    autoFocus
                  />
                  <button onClick={() => handleUpdate(team.id)} className="p-1.5 text-success hover:bg-success/10 rounded">
                    <Check size={14} weight="bold" />
                  </button>
                  <button onClick={() => setEditingId(null)} className="p-1.5 text-text-muted hover:text-text-primary rounded text-xs">
                    ✕
                  </button>
                </>
              ) : (
                <>
                  <div className="w-8 h-8 rounded-lg bg-teal/10 flex items-center justify-center flex-shrink-0">
                    <Icon size={16} weight="fill" className="text-teal" />
                  </div>
                  <span className="font-grotesk font-medium text-sm text-text-primary flex-1">{team.name}</span>
                  <button
                    onClick={() => { setEditingId(team.id); setEditName(team.name); setEditIcon(team.icon); }}
                    className="p-1.5 text-text-muted hover:text-teal hover:bg-teal/10 rounded transition-colors"
                  >
                    <PencilSimple size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(team.id, team.name)}
                    className="p-1.5 text-text-muted hover:text-danger hover:bg-danger/10 rounded transition-colors"
                  >
                    <Trash size={14} />
                  </button>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Add new team */}
      <div className="bg-surface border border-border rounded-lg p-4">
        <p className="font-grotesk font-semibold text-xs text-text-muted uppercase tracking-wider mb-3">Agregar equipo</p>
        <div className="flex gap-2 mb-3 flex-wrap">
          {ICON_OPTIONS.map(({ name, icon: OptIcon }) => (
            <button
              key={name}
              onClick={() => setNewIcon(name)}
              className={`p-2 rounded-lg transition-colors ${
                newIcon === name ? "bg-teal/15 border border-teal text-teal" : "bg-bg border border-transparent text-text-muted hover:text-text-primary"
              }`}
            >
              <OptIcon size={18} weight={newIcon === name ? "fill" : "regular"} />
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Nombre del equipo"
            className="flex-1 bg-bg border border-border rounded px-3 py-2 text-sm focus:border-teal focus:outline-none"
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          />
          <button
            onClick={handleAdd}
            disabled={!newName.trim() || saving}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold bg-teal text-bg rounded hover:bg-teal-dim transition-colors disabled:opacity-30"
          >
            <Plus size={14} weight="bold" />
            Agregar
          </button>
        </div>
      </div>
    </div>
  );
}
