"use client";

import { Trophy } from "@phosphor-icons/react";
import type { Prize } from "@/lib/types";

const POSITION_LABELS: Record<number, string> = {
  1: "1er Puesto",
  2: "2do Puesto",
  3: "3er Puesto",
};

const POSITION_COLORS: Record<number, string> = {
  1: "border-gold text-gold",
  2: "border-mercedes-silver text-mercedes-silver",
  3: "border-orange-400 text-orange-400",
};

export default function PrizeCard({ prize }: { prize: Prize }) {
  const label = POSITION_LABELS[prize.position] || `${prize.position}to Puesto`;
  const colorClass = POSITION_COLORS[prize.position] || "border-border text-text-muted";

  return (
    <div className={`bg-surface border-2 ${colorClass.split(" ")[0]} rounded-lg overflow-hidden`}>
      {prize.image_url ? (
        <div className="aspect-[16/9] bg-surface-raised">
          <img src={prize.image_url} alt={prize.title} className="w-full h-full object-cover" />
        </div>
      ) : (
        <div className="aspect-[16/9] bg-surface-raised flex items-center justify-center">
          <Trophy size={48} className={colorClass.split(" ")[1] || "text-text-muted"} weight="fill" />
        </div>
      )}

      <div className="p-4 space-y-2">
        <span className={`text-xs font-semibold uppercase tracking-wider ${colorClass.split(" ")[1]}`}>
          {label}
        </span>
        <h3 className="font-sora font-bold text-lg text-text-primary">{prize.title}</h3>
        {prize.description && (
          <p className="font-grotesk text-sm text-text-secondary">{prize.description}</p>
        )}
      </div>
    </div>
  );
}
