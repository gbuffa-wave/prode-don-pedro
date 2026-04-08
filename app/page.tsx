import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-6">
      <h1 className="font-sora font-extrabold text-5xl md:text-7xl tracking-tightest text-center mb-4">
        Prode Mundial<br />
        <span className="text-teal">2026</span>
      </h1>
      <p className="font-grotesk text-text-secondary text-center max-w-md mb-8">
        Pronostica los resultados del Mundial y competi con tus companeros.
      </p>
      <Link
        href="/login"
        className="font-grotesk font-semibold text-sm px-8 py-3 bg-teal text-bg rounded hover:bg-teal-dim transition-colors"
      >
        Ingresar
      </Link>
    </div>
  );
}
