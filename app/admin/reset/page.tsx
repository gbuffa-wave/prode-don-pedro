"use client";

import { useState } from "react";
import { Warning, ArrowCounterClockwise, CheckCircle } from "@phosphor-icons/react";

export default function AdminResetPage() {
  const [confirmation, setConfirmation] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const canReset = confirmation === "REINICIAR";

  async function handleReset() {
    if (!canReset) return;
    setLoading(true);

    const res = await fetch("/api/admin/reset", { method: "POST" });
    if (res.ok) {
      setDone(true);
      setConfirmation("");
    }

    setLoading(false);
  }

  if (done) {
    return (
      <div className="text-center py-12">
        <CheckCircle size={48} className="text-success mx-auto mb-3" weight="fill" />
        <h2 className="font-sora font-bold text-lg mb-2">Prode reiniciado</h2>
        <p className="text-text-secondary text-sm">
          Se borraron todos los pronósticos, puntajes y resultados. Los usuarios y equipos se mantienen.
        </p>
        <button
          onClick={() => setDone(false)}
          className="mt-6 px-4 py-2 rounded bg-surface border border-border text-sm text-text-secondary hover:text-text-primary transition-colors"
        >
          Volver
        </button>
      </div>
    );
  }

  return (
    <div>
      <h2 className="font-sora font-bold text-lg mb-6">Reiniciar Prode</h2>

      <div className="bg-red-500/5 border border-red-500/30 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <Warning size={24} className="text-red-500 shrink-0 mt-0.5" weight="fill" />
          <div>
            <p className="font-grotesk font-semibold text-sm text-red-400 mb-1">
              Zona peligrosa
            </p>
            <p className="text-sm text-red-300/80">
              Esta acción borra todos los pronósticos, puntajes y resultados. Los usuarios y equipos se mantienen.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-lg p-6">
        <p className="text-sm text-text-secondary mb-4">
          Para confirmar, escribí <span className="font-mono font-bold text-text-primary">REINICIAR</span> en el campo de abajo.
        </p>

        <input
          type="text"
          value={confirmation}
          onChange={(e) => setConfirmation(e.target.value)}
          placeholder="Escribí REINICIAR"
          className="w-full bg-bg border border-border rounded px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-red-500 focus:outline-none mb-4"
        />

        <button
          onClick={handleReset}
          disabled={!canReset || loading}
          className={`flex items-center justify-center gap-2 w-full px-4 py-3 rounded font-semibold text-sm transition-colors ${
            canReset
              ? "bg-red-500 text-white hover:bg-red-600"
              : "bg-red-500/20 text-red-500/40 cursor-not-allowed"
          }`}
        >
          <ArrowCounterClockwise size={16} weight="bold" />
          {loading ? "Reiniciando..." : "Reiniciar Prode"}
        </button>
      </div>
    </div>
  );
}
