"use client";

import { useState } from "react";
import { Plus, Trash, ImageSquare, Check } from "@phosphor-icons/react";
import type { Prize } from "@/lib/types";

export default function AdminPrizesPage() {
  const [prizes, setPrizes] = useState<Prize[]>([
    { id: 1, position: 1, title: "Viaje a ver la final", description: "Viaje all-inclusive para dos personas.", image_url: null, created_at: "" },
    { id: 2, position: 2, title: "Camiseta oficial firmada", description: "Camiseta de la seleccion argentina.", image_url: null, created_at: "" },
    { id: 3, position: 3, title: "Kit Mercedes-Benz", description: "Kit exclusivo de merchandising.", image_url: null, created_at: "" },
  ]);
  const [saved, setSaved] = useState(false);

  function addPrize() {
    const nextPos = prizes.length + 1;
    setPrizes([...prizes, { id: Date.now(), position: nextPos, title: "", description: "", image_url: null, created_at: "" }]);
  }

  function updatePrize(id: number, field: keyof Prize, value: string) {
    setPrizes((prev) => prev.map((p) => p.id === id ? { ...p, [field]: value } : p));
  }

  function removePrize(id: number) {
    setPrizes((prev) => prev.filter((p) => p.id !== id).map((p, i) => ({ ...p, position: i + 1 })));
  }

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const positionLabel = (pos: number) => {
    if (pos === 1) return "1er";
    if (pos === 2) return "2do";
    if (pos === 3) return "3er";
    return `${pos}to`;
  };

  return (
    <div>
      <h2 className="font-sora font-bold text-lg mb-4">Gestionar Premios</h2>
      <div className="space-y-4">
        {prizes.map((prize) => (
          <div key={prize.id} className="bg-surface border border-border rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-3">
              <span className="font-sora font-bold text-teal text-sm w-8 flex-shrink-0">
                {positionLabel(prize.position)}
              </span>
              <input
                type="text"
                value={prize.title}
                onChange={(e) => updatePrize(prize.id, "title", e.target.value)}
                placeholder="Titulo del premio"
                className="flex-1 bg-bg border border-border rounded px-3 py-2 text-sm focus:border-teal focus:outline-none"
              />
              <button
                onClick={() => removePrize(prize.id)}
                className="p-2 text-text-muted hover:text-danger transition-colors"
                title="Eliminar premio"
              >
                <Trash size={16} />
              </button>
            </div>
            <textarea
              value={prize.description || ""}
              onChange={(e) => updatePrize(prize.id, "description", e.target.value)}
              placeholder="Descripcion del premio"
              rows={2}
              className="w-full bg-bg border border-border rounded px-3 py-2 text-sm focus:border-teal focus:outline-none resize-none"
            />
            <div className="flex items-center gap-3">
              <ImageSquare size={16} className="text-text-muted flex-shrink-0" />
              <input
                type="file"
                accept="image/*"
                className="text-xs text-text-muted file:mr-2 file:px-3 file:py-1.5 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-surface-raised file:text-text-primary hover:file:bg-border file:cursor-pointer file:transition-colors"
              />
            </div>
          </div>
        ))}
      </div>
      <div className="flex gap-3 mt-6">
        <button
          onClick={addPrize}
          className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold border border-border rounded hover:border-text-muted transition-colors"
        >
          <Plus size={14} /> Agregar premio
        </button>
        <button
          onClick={handleSave}
          className={`px-6 py-2 text-sm font-semibold rounded transition-all ${
            saved ? "bg-success text-bg" : "bg-teal text-bg hover:bg-teal-dim"
          }`}
        >
          {saved ? <span className="flex items-center gap-1"><Check size={14} weight="bold" /> Guardado</span> : "Guardar premios"}
        </button>
      </div>
    </div>
  );
}
