"use client";

import { Crown, Calendar } from "@phosphor-icons/react";

export default function AdminWinnersPage() {
  return (
    <div>
      <h2 className="font-sora font-bold text-lg mb-4">Ganadores</h2>
      <p className="text-text-secondary text-sm mb-6">
        Los ganadores se calculan automaticamente. Aca podes ver y gestionar los ganadores parciales del torneo.
      </p>

      {/* Weekly winners */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <Crown size={16} className="text-gold" weight="fill" />
          <h3 className="font-sora font-semibold text-sm">Ganadores semanales</h3>
        </div>
        <div className="bg-surface border border-border rounded-lg divide-y divide-border">
          {[
            { week: "Semana 1", name: "Jugador 3", points: 85, range: "11 - 17 Jun" },
            { week: "Semana 2", name: "Jugador 12", points: 78, range: "18 - 24 Jun" },
            { week: "Semana 3", name: "Jugador 1", points: 92, range: "25 Jun - 1 Jul" },
          ].map((w) => (
            <div key={w.week} className="px-4 py-3 flex items-center justify-between">
              <div>
                <p className="font-grotesk text-sm font-medium text-text-primary">{w.name}</p>
                <p className="text-[10px] text-text-muted">{w.week} — {w.range}</p>
              </div>
              <span className="font-sora font-bold text-gold">{w.points} pts</span>
            </div>
          ))}
        </div>
      </div>

      {/* Daily top */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Calendar size={16} className="text-teal" weight="fill" />
          <h3 className="font-sora font-semibold text-sm">Mejores del dia (ultimos 7 dias)</h3>
        </div>
        <div className="bg-surface border border-border rounded-lg divide-y divide-border">
          {[
            { date: "Sab 14 Jun", name: "Jugador 1", points: 30 },
            { date: "Vie 13 Jun", name: "Jugador 7", points: 26 },
            { date: "Lun 16 Jun", name: "Jugador 3", points: 25 },
            { date: "Jue 12 Jun", name: "Jugador 12", points: 20 },
            { date: "Mie 11 Jun", name: "Jugador 3", points: 23 },
            { date: "Mar 17 Jun", name: "Jugador 8", points: 21 },
            { date: "Dom 15 Jun", name: "Jugador 19", points: 18 },
          ].map((d) => (
            <div key={d.date} className="px-4 py-3 flex items-center justify-between">
              <div>
                <p className="font-grotesk text-sm font-medium text-text-primary">{d.name}</p>
                <p className="text-[10px] text-text-muted">{d.date}</p>
              </div>
              <span className="font-sora font-bold text-teal">{d.points} pts</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
