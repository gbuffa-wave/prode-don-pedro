"use client";

import { useState, useEffect } from "react";
import { Check, FilmSlate, Megaphone, MicrophoneStage, Tree, Moon, Sun, Lighthouse, Compass, Star } from "@phosphor-icons/react";
import UserAvatar from "@/components/UserAvatar";
import type { IconProps } from "@phosphor-icons/react";

interface AppUser {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  role: string;
  team: string | null;
  created_at: string;
}

const EQUIPOS: { name: string; icon: React.ComponentType<IconProps> }[] = [
  { name: "Contenidos", icon: FilmSlate },
  { name: "Comunicación", icon: Megaphone },
  { name: "Eventos", icon: MicrophoneStage },
  { name: "Bosque", icon: Tree },
  { name: "Luna", icon: Moon },
  { name: "Sol", icon: Sun },
  { name: "Faro", icon: Lighthouse },
  { name: "Dirección", icon: Compass },
  { name: "Estrella", icon: Star },
];

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [saved, setSaved] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetch("/api/admin/users")
      .then(res => res.json())
      .then(data => { setUsers(data.users || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  async function handleTeamChange(userId: string, team: string) {
    setSaving(prev => ({ ...prev, [userId]: true }));

    await fetch("/api/admin/users", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, team }),
    });

    setUsers(prev => prev.map(u => u.id === userId ? { ...u, team } : u));
    setSaving(prev => ({ ...prev, [userId]: false }));
    setSaved(prev => ({ ...prev, [userId]: true }));
    setTimeout(() => setSaved(prev => ({ ...prev, [userId]: false })), 2000);
  }

  async function handleRoleChange(userId: string, role: string) {
    await fetch("/api/admin/users", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, role }),
    });
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, role } : u));
  }

  if (loading) return <div className="text-center py-12"><p className="text-text-muted text-sm">Cargando usuarios...</p></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-sora font-bold text-lg">Usuarios y Equipos</h2>
        <span className="text-xs text-text-muted">{users.length} usuarios</span>
      </div>

      <div className="space-y-3">
        {users.map((user) => {
          const teamInfo = EQUIPOS.find(e => e.name === user.team);
          const TeamIcon = teamInfo?.icon;

          return (
            <div key={user.id} className="bg-surface border border-border rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <UserAvatar src={user.avatar_url} name={user.display_name} size={36} />
                <div className="flex-1 min-w-0">
                  <p className="font-grotesk font-semibold text-sm text-text-primary truncate">
                    {user.display_name || "Sin nombre"}
                  </p>
                  <p className="text-[10px] text-text-muted">{user.id.slice(0, 8)}...</p>
                </div>
                {/* Role selector */}
                <select
                  value={user.role}
                  onChange={(e) => handleRoleChange(user.id, e.target.value)}
                  className="bg-bg border border-border rounded px-2 py-1 text-[10px] text-text-secondary focus:border-teal focus:outline-none"
                >
                  <option value="player">Jugador</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              {/* Team selector */}
              <div className="flex gap-1.5 flex-wrap">
                {EQUIPOS.map(({ name, icon: Icon }) => (
                  <button
                    key={name}
                    onClick={() => handleTeamChange(user.id, name)}
                    disabled={saving[user.id]}
                    className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium transition-all ${
                      user.team === name
                        ? "bg-teal/15 border border-teal text-teal"
                        : "bg-bg border border-transparent text-text-muted hover:border-border hover:text-text-secondary"
                    }`}
                  >
                    <Icon size={12} weight={user.team === name ? "fill" : "regular"} />
                    {name}
                  </button>
                ))}
              </div>

              {saved[user.id] && (
                <p className="text-[10px] text-success mt-2 flex items-center gap-1">
                  <Check size={10} weight="bold" /> Guardado
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
