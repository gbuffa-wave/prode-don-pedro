"use client";

import { useState, useEffect } from "react";
import { Check, Trash } from "@phosphor-icons/react";
import UserAvatar from "@/components/UserAvatar";
import { getTeamIcon } from "@/lib/team-icons";

interface AppUser {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  role: string;
  team: string | null;
  created_at: string;
}

interface InternalTeam {
  id: number;
  name: string;
  icon: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [teams, setTeams] = useState<InternalTeam[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [saved, setSaved] = useState<Record<string, boolean>>({});
  const [deleting, setDeleting] = useState<Record<string, boolean>>({});

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/users").then(r => r.json()),
      fetch("/api/admin/teams").then(r => r.json()),
    ]).then(([usersData, teamsData]) => {
      setUsers(usersData.users || []);
      setTeams(teamsData.teams || []);
      setLoading(false);
    }).catch(() => setLoading(false));
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

  async function handleDelete(userId: string, displayName: string | null) {
    const name = displayName || userId.slice(0, 8);
    if (!confirm(`¿Eliminar a ${name}? Se borrarán sus pronósticos y puntajes. Esta acción no se puede deshacer.`)) return;

    setDeleting(prev => ({ ...prev, [userId]: true }));

    await fetch("/api/admin/users", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });

    setUsers(prev => prev.filter(u => u.id !== userId));
    setDeleting(prev => ({ ...prev, [userId]: false }));
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
          const teamInfo = teams.find(t => t.name === user.team);

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
                {/* Delete button */}
                <button
                  onClick={() => handleDelete(user.id, user.display_name)}
                  disabled={deleting[user.id]}
                  className="p-1.5 rounded text-red-500/50 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                  title="Eliminar usuario"
                >
                  <Trash size={14} weight="bold" />
                </button>
              </div>

              {/* Team selector */}
              <div className="flex gap-1.5 flex-wrap">
                {teams.map((team) => {
                  const Icon = getTeamIcon(team.icon);
                  return (
                  <button
                    key={team.name}
                    onClick={() => handleTeamChange(user.id, team.name)}
                    disabled={saving[user.id]}
                    className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium transition-all ${
                      user.team === team.name
                        ? "bg-teal/15 border border-teal text-teal"
                        : "bg-bg border border-transparent text-text-muted hover:border-border hover:text-text-secondary"
                    }`}
                  >
                    <Icon size={12} weight={user.team === team.name ? "fill" : "regular"} />
                    {team.name}
                  </button>
                  );
                })}
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
