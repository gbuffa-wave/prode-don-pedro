import Link from "next/link";

export default function NotFound() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      <h2 className="font-sora font-bold text-xl mb-3">Esta página no existe</h2>
      <p className="text-text-secondary text-sm mb-6">
        El link que seguiste está roto o la página fue movida.
      </p>
      <Link
        href="/fixture"
        className="inline-block px-6 py-2 text-sm font-semibold bg-teal text-bg rounded hover:bg-teal-dim transition-colors"
      >
        Ir al fixture
      </Link>
    </div>
  );
}
