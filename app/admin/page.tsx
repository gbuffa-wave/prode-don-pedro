"use client";

import { SoccerBall, Users, Target, Trophy } from "@phosphor-icons/react";

const stats = [
  { label: "Usuarios registrados", value: "4.832", icon: Users, color: "text-teal" },
  { label: "Pronosticos cargados", value: "38.240", icon: Target, color: "text-gold" },
  { label: "Partidos jugados", value: "24", icon: SoccerBall, color: "text-success" },
  { label: "Partidos pendientes", value: "40", icon: Trophy, color: "text-warning" },
];

export default function AdminDashboard() {
  return (
    <div>
      <h2 className="font-sora font-bold text-lg mb-4">Dashboard</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="bg-surface border border-border rounded-lg p-4">
            <s.icon size={20} className={`${s.color} mb-2`} />
            <p className={`font-sora font-bold text-2xl ${s.color}`}>{s.value}</p>
            <p className="text-xs text-text-muted mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Recent activity */}
      <h3 className="font-sora font-semibold text-sm text-text-muted uppercase tracking-wider mb-3">Actividad reciente</h3>
      <div className="bg-surface border border-border rounded-lg divide-y divide-border">
        {[
          { action: "Resultado cargado", detail: "Brasil 2 - 0 Colombia", time: "Hace 2 horas" },
          { action: "Resultado cargado", detail: "Espana 3 - 1 Arabia Saudita", time: "Hace 3 horas" },
          { action: "Puntaje actualizado", detail: "Regla 'resultado exacto' → 10 pts", time: "Hace 1 dia" },
          { action: "Premio agregado", detail: "1er puesto: Viaje a ver la final", time: "Hace 2 dias" },
        ].map((item, i) => (
          <div key={i} className="px-4 py-3 flex items-center justify-between">
            <div>
              <p className="font-grotesk text-sm text-text-primary">{item.action}</p>
              <p className="text-xs text-text-muted">{item.detail}</p>
            </div>
            <span className="text-xs text-text-muted whitespace-nowrap ml-4">{item.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
