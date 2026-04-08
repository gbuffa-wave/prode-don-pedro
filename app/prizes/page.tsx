import PrizeCard from "@/components/PrizeCard";
import type { Prize } from "@/lib/types";

const MOCK_PRIZES: Prize[] = [
  { id: 1, position: 1, title: "Viaje a ver la final", description: "Viaje all-inclusive para dos personas a ver la final del Mundial 2026.", image_url: null, created_at: "" },
  { id: 2, position: 2, title: "Camiseta oficial firmada", description: "Camiseta de la seleccion argentina con firmas del plantel.", image_url: null, created_at: "" },
  { id: 3, position: 3, title: "Kit Mercedes-Benz", description: "Kit exclusivo de merchandising oficial Mercedes-Benz.", image_url: null, created_at: "" },
];

export default function PrizesPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="font-sora font-bold text-2xl mb-1">Premios</h1>
        <p className="text-text-secondary text-sm">Conoce que podes ganar.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {MOCK_PRIZES.map((prize) => (
          <PrizeCard key={prize.id} prize={prize} />
        ))}
      </div>
    </div>
  );
}
