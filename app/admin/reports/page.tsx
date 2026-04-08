"use client";

import { ChartBar, DownloadSimple, Users, Target } from "@phosphor-icons/react";

export default function AdminReportsPage() {
  return (
    <div>
      <h2 className="font-sora font-bold text-lg mb-4">Reportes</h2>

      <div className="space-y-4">
        <div className="bg-surface border border-border rounded-lg p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ChartBar size={24} className="text-teal" />
              <div>
                <h3 className="font-grotesk font-semibold text-sm">Ranking General</h3>
                <p className="text-xs text-text-muted">Tabla de posiciones completa con puntos y aciertos</p>
              </div>
            </div>
            <a
              href="/api/export"
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-teal text-bg rounded hover:bg-teal-dim transition-colors"
            >
              <DownloadSimple size={16} weight="bold" />
              Excel
            </a>
          </div>
        </div>

        <div className="bg-surface border border-border rounded-lg p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users size={24} className="text-gold" />
              <div>
                <h3 className="font-grotesk font-semibold text-sm">Participacion</h3>
                <p className="text-xs text-text-muted">Usuarios activos, pronosticos por partido, engagement</p>
              </div>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-teal text-bg rounded hover:bg-teal-dim transition-colors">
              <DownloadSimple size={16} weight="bold" />
              Excel
            </button>
          </div>
        </div>

        <div className="bg-surface border border-border rounded-lg p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Target size={24} className="text-success" />
              <div>
                <h3 className="font-grotesk font-semibold text-sm">Pronosticos por partido</h3>
                <p className="text-xs text-text-muted">Detalle de cada pronostico con puntaje obtenido</p>
              </div>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-teal text-bg rounded hover:bg-teal-dim transition-colors">
              <DownloadSimple size={16} weight="bold" />
              Excel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
