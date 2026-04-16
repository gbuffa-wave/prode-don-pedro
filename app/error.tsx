"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      <h2 className="font-sora font-bold text-xl mb-3">Ups, algo salió mal</h2>
      <p className="text-text-secondary text-sm mb-6">
        Intentá de nuevo. Si persiste, avisale al administrador.
      </p>
      <button
        onClick={reset}
        className="px-6 py-2 text-sm font-semibold bg-teal text-bg rounded hover:bg-teal-dim transition-colors"
      >
        Reintentar
      </button>
    </div>
  );
}
