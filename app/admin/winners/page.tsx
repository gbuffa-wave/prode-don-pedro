"use client";

import { Crown, Calendar, Trophy } from "@phosphor-icons/react";

export default function AdminWinnersPage() {
  return (
    <div>
      <h2 className="font-sora font-bold text-lg mb-4">Ganadores</h2>
      <p className="text-text-secondary text-sm mb-6">
        Los ganadores se calculan automáticamente. Acá podés ver los ganadores parciales del torneo.
      </p>

      {/* Weekly winners */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <Crown size={16} className="text-gold" weight="fill" />
          <h3 className="font-sora font-semibold text-sm">Ganadores semanales</h3>
        </div>
        <div className="text-center py-8">
          <Trophy size={36} className="text-text-muted mx-auto mb-2" />
          <p className="text-text-muted text-sm">Todavía no hay ganadores semanales.</p>
          <p className="text-text-muted text-xs mt-1">Se calculan al finalizar cada semana del torneo.</p>
        </div>
      </div>

      {/* Daily top */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Calendar size={16} className="text-teal" weight="fill" />
          <h3 className="font-sora font-semibold text-sm">Mejores del día</h3>
        </div>
        <div className="text-center py-8">
          <Trophy size={36} className="text-text-muted mx-auto mb-2" />
          <p className="text-text-muted text-sm">Todavía no hay jornadas completadas.</p>
          <p className="text-text-muted text-xs mt-1">Se calculan al finalizar los partidos de cada día.</p>
        </div>
      </div>
    </div>
  );
}
