/**
 * CONFIGURACIÓN DE MARCA — DON PEDRO
 * ────────────────────────────────────
 * Para adaptar a otro cliente: modificar este archivo,
 * reemplazar /public/logo.png y ajustar colores en app/globals.css
 */

export const brand = {
  /** Nombre del cliente */
  clientName: "Don Pedro",

  /** Título del prode */
  title: "Prode",

  /** Año del torneo */
  year: "2026",

  /** Nombre completo para metas y emails */
  tournamentName: "Prode Mundial 2026",

  /** Descripción corta para meta tags */
  description: "Pronósticos del Mundial 2026 — Don Pedro",

  /** Logo en /public */
  logoSrc: "/logo-don-pedro.png",
  logoAlt: "Don Pedro",

  /** Claim de marca */
  claim: "Conectando oportunidades",

  /** Fecha de inicio del primer partido (ISO 8601 UTC) */
  worldCupStart: "2026-06-11T17:00:00Z",

  /** Dominio de producción */
  domain: "https://prode.donpedro.com.ar",

  /** Email de contacto */
  contactEmail: "contacto@donpedro.com.ar",
} as const;

export type Brand = typeof brand;
