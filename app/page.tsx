"use client";

import Link from "next/link";
import Image from "next/image";
import Countdown from "@/components/Countdown";
import { brand } from "@/lib/brand";

export default function HomePage() {
  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-6">
      <Image
        src={brand.logoSrc}
        alt={brand.logoAlt}
        width={140}
        height={40}
        className="h-8 md:h-10 w-auto object-contain mb-10"
        priority
      />
      <h1 className="font-sora font-extrabold text-5xl md:text-7xl tracking-tightest text-center mb-4">
        {brand.title} Mundial<br />
        <span className="text-teal">{brand.year}</span>
      </h1>
      <p className="font-grotesk text-text-secondary text-center max-w-md mb-8">
        Pronosticá los resultados del Mundial y competí con tus compañeros.
      </p>
      <Countdown targetDate={brand.worldCupStart} />
      <div className="mt-8">
        <Link
          href="/login"
          className="font-grotesk font-semibold text-sm px-8 py-3 bg-teal text-bg rounded hover:bg-teal-dim transition-colors"
        >
          Ingresar
        </Link>
      </div>
    </div>
  );
}
