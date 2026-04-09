"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Trophy, SoccerBall, Crown, Star, Medal, Target, Calendar, ListBullets, FunnelSimple, TreeStructure, CaretDown, CaretUp, Check, GearSix, Users, Gear, ChartBar, EnvelopeSimple } from "@phosphor-icons/react";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import Countdown from "@/components/Countdown";
import confetti from "canvas-confetti";
import UserAvatar from "@/components/UserAvatar";

// ─── Mock data for demo ───
const DEMO_USER = { name: "María García", avatar: null, team: "Comunicación" };

const DEMO_LEADERBOARD = [
  { rank: 1, name: "Carlos López", points: 87, exact: 6, avatar: null },
  { rank: 2, name: "María García", points: 82, exact: 5, avatar: null },
  { rank: 3, name: "Juan Pérez", points: 78, exact: 4, avatar: null },
  { rank: 4, name: "Ana Martínez", points: 71, exact: 3, avatar: null },
  { rank: 5, name: "Diego Ruiz", points: 65, exact: 3, avatar: null },
  { rank: 6, name: "Lucía Fernández", points: 59, exact: 2, avatar: null },
  { rank: 7, name: "Pablo Torres", points: 54, exact: 2, avatar: null },
  { rank: 8, name: "Valentina Sosa", points: 48, exact: 1, avatar: null },
];

const DEMO_PRIZES = [
  { position: 1, title: "Viaje a ver la final", description: "Viaje all-inclusive para dos personas." },
  { position: 2, title: "Camiseta oficial firmada", description: "Camiseta con firmas del plantel." },
  { position: 3, title: "Kit exclusivo", description: "Kit de merchandising premium." },
];

type DemoTab = "fixture" | "ranking" | "ganadores" | "premios" | "admin";

const PODIUM_STYLES = {
  1: { border: "border-gold", bg: "bg-gold/5", text: "text-gold", size: "h-28", order: "order-2" },
  2: { border: "border-mercedes-silver", bg: "bg-mercedes-silver/5", text: "text-mercedes-silver", size: "h-22", order: "order-1" },
  3: { border: "border-orange-400", bg: "bg-orange-400/5", text: "text-orange-400", size: "h-18", order: "order-3" },
} as const;

export default function DemoPage() {
  const [tab, setTab] = useState<DemoTab>("fixture");
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("matches")
      .select("*, home_team:teams!home_team_id(*), away_team:teams!away_team_id(*)")
      .order("match_date")
      .limit(8)
      .then(({ data }) => {
        setMatches(data || []);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (tab === "ranking") {
      const colors = ["#0c5cac", "#D4A853", "#22C55E", "#F59E0B", "#ffffff"];
      confetti({ particleCount: 40, angle: 60, spread: 55, origin: { x: 0, y: 0.6 }, colors });
      confetti({ particleCount: 40, angle: 120, spread: 55, origin: { x: 1, y: 0.6 }, colors });
    }
    if (tab === "premios") {
      const colors = ["#D4A853", "#B8922E", "#FFD700"];
      confetti({ particleCount: 40, spread: 80, origin: { x: 0.3, y: 0.3 }, colors, shapes: ["star"], scalar: 1.5, ticks: 150 });
      confetti({ particleCount: 40, spread: 80, origin: { x: 0.7, y: 0.3 }, colors, shapes: ["star"], scalar: 1.5, ticks: 150 });
    }
  }, [tab]);

  const TABS: { key: DemoTab; label: string; icon: typeof SoccerBall }[] = [
    { key: "fixture", label: "Fixture", icon: SoccerBall },
    { key: "ranking", label: "Ranking", icon: Trophy },
    { key: "ganadores", label: "Ganadores", icon: Crown },
    { key: "premios", label: "Premios", icon: Medal },
    { key: "admin", label: "Admin", icon: GearSix },
  ];

  return (
    <div className="min-h-dvh">
      {/* Demo banner */}
      <div className="bg-gold/10 border-b border-gold/30 px-4 py-2 text-center">
        <span className="text-gold text-xs font-semibold uppercase tracking-wider">Modo Demo — Vista previa de la plataforma</span>
      </div>

      {/* Header */}
      <nav className="bg-bg/95 backdrop-blur-md border-b border-border px-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between h-12">
          <div className="flex items-center gap-2">
            <Image src="/logo-wave.png" alt="Wave Brands" width={45} height={13} className="h-2.5 w-auto object-contain" />
            <div className="h-3 w-px bg-border" />
            <span className="font-sora font-bold text-sm tracking-tight">
              <span className="text-text-primary">Prode</span>
              <span className="text-teal ml-1">2026</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-muted hidden sm:block">{DEMO_USER.name}</span>
            <UserAvatar src={null} name={DEMO_USER.name} size={24} />
          </div>
        </div>
        {/* Tabs */}
        <div className="max-w-3xl mx-auto flex items-center justify-around h-10 border-t border-border/50">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex items-center gap-1 px-3 py-1 rounded transition-colors ${
                tab === key ? "text-teal" : "text-text-muted hover:text-text-primary"
              }`}
            >
              <Icon size={14} weight={tab === key ? "fill" : "regular"} />
              <span className="text-[11px] font-semibold">{label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-3xl mx-auto">
        {/* ─── FIXTURE ─── */}
        {tab === "fixture" && (
          <div>
            {/* Hero */}
            <div className="relative overflow-hidden bg-surface border-b border-border">
              <img src="/hero-banner.png" alt="" className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/60 to-transparent" />
              <div className="relative z-10 px-4 pt-8 pb-10">
                <p className="font-grotesk font-semibold text-[10px] text-teal tracking-widest uppercase mb-3">Mundial 2026</p>
                <h1 className="font-sora font-extrabold text-3xl md:text-5xl tracking-tightest leading-none mb-3">
                  Prode <span className="text-teal">2026</span>
                </h1>
                <p className="font-grotesk text-sm text-text-secondary max-w-md">
                  Pronosticá los resultados de cada partido y competí con tus compañeros.
                </p>
                <div className="mt-6">
                  <p className="text-[10px] text-text-muted uppercase tracking-wider mb-2">Comienza en</p>
                  <Countdown targetDate="2026-06-11T17:00:00Z" />
                </div>
              </div>
            </div>

            {/* Scoring info */}
            <div className="px-4 py-6">
              <div className="bg-surface border border-border rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2 mb-3">
                  <Target size={16} weight="fill" className="text-teal" />
                  <span className="font-sora font-bold text-sm">¿Cómo se puntúa?</span>
                </div>
                <div className="space-y-2">
                  {[
                    { label: "Resultado exacto", pts: 10, color: "text-gold" },
                    { label: "Ganador + diferencia", pts: 5, color: "text-teal" },
                    { label: "Solo ganador", pts: 3, color: "text-text-primary" },
                    { label: "Campeón del Mundial", pts: 50, color: "text-gold" },
                  ].map(r => (
                    <div key={r.label} className="flex items-center justify-between text-xs">
                      <span className="text-text-secondary">{r.label}</span>
                      <span className={`font-sora font-bold ${r.color}`}>+{r.pts} pts</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sample matches */}
              <p className="font-grotesk font-semibold text-xs text-teal uppercase tracking-wider mb-3">Próximos partidos</p>
              {loading ? (
                <p className="text-text-muted text-sm text-center py-8">Cargando...</p>
              ) : (
                <div className="space-y-2">
                  {matches.slice(0, 6).map((m: any) => (
                    <div key={m.id} className="bg-surface border border-border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] text-text-muted uppercase tracking-wider">Grupo {m.group_label}</span>
                        <span className="text-[10px] text-warning font-medium">
                          {new Date(m.match_date).toLocaleDateString("es-AR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 flex-1">
                          <img src={m.home_team.flag_url} alt="" className="w-7 h-4 object-cover rounded-sm" />
                          <span className="font-grotesk font-medium text-sm">{m.home_team.name}</span>
                        </div>
                        <div className="flex items-center gap-2 mx-3">
                          <div className="w-8 h-8 bg-bg border border-border rounded flex items-center justify-center text-text-muted text-xs">-</div>
                          <span className="text-text-muted text-xs">-</span>
                          <div className="w-8 h-8 bg-bg border border-border rounded flex items-center justify-center text-text-muted text-xs">-</div>
                          <span className="ml-1 px-2 py-1 text-[10px] font-semibold bg-teal text-bg rounded">OK</span>
                        </div>
                        <div className="flex items-center gap-2 flex-1 justify-end">
                          <span className="font-grotesk font-medium text-sm text-right">{m.away_team.name}</span>
                          <img src={m.away_team.flag_url} alt="" className="w-7 h-4 object-cover rounded-sm" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ─── RANKING ─── */}
        {tab === "ranking" && (
          <div className="px-4 py-6">
            <h2 className="font-sora font-bold text-2xl mb-1">Ranking</h2>
            <p className="text-text-secondary text-sm mb-6">Tabla de posiciones general.</p>

            {/* Podium */}
            <div className="flex items-end justify-center gap-3 mb-8">
              {[DEMO_LEADERBOARD[1], DEMO_LEADERBOARD[0], DEMO_LEADERBOARD[2]].map((entry) => {
                const style = PODIUM_STYLES[entry.rank as 1 | 2 | 3];
                return (
                  <motion.div
                    key={entry.rank}
                    className={`flex flex-col items-center flex-1 max-w-[120px] ${style.order}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: entry.rank * 0.2, duration: 0.5 }}
                  >
                    {entry.rank === 1 && <Crown size={20} weight="fill" className="text-gold mb-1" />}
                    <UserAvatar src={null} name={entry.name} size={40} className={`border-2 ${style.border}`} />
                    <span className="font-grotesk text-xs font-medium text-center mt-1 truncate w-full">{entry.name}</span>
                    <span className={`font-sora font-extrabold text-lg ${style.text}`}>{entry.points}</span>
                    <span className="text-[9px] text-text-muted">pts</span>
                    <motion.div
                      initial={{ scaleY: 0 }}
                      animate={{ scaleY: 1 }}
                      transition={{ delay: entry.rank * 0.2 + 0.3, duration: 0.4 }}
                      style={{ originY: 1 }}
                      className={`w-full ${style.size} ${style.bg} border ${style.border} rounded-t-lg mt-2 flex items-center justify-center`}
                    >
                      <Trophy size={16} weight="fill" className={style.text} />
                    </motion.div>
                  </motion.div>
                );
              })}
            </div>

            {/* Table */}
            <div className="bg-surface border border-border rounded-lg overflow-hidden">
              <div className="grid grid-cols-[3rem_1fr_4rem_4rem] gap-2 px-4 py-3 bg-surface-raised text-xs text-text-muted font-semibold uppercase tracking-wider">
                <span>#</span><span>Jugador</span><span className="text-center">Pts</span><span className="text-center">Exacto</span>
              </div>
              {DEMO_LEADERBOARD.slice(3).map((e) => (
                <div key={e.rank} className={`grid grid-cols-[3rem_1fr_4rem_4rem] gap-2 px-4 py-3 border-t border-border items-center ${e.rank === 5 ? "bg-teal/5 border-l-2 border-l-teal" : ""}`}>
                  <span className="font-sora font-bold text-sm text-text-secondary">{e.rank}</span>
                  <span className="font-grotesk text-sm text-text-primary">{e.name} {e.rank === 5 && <span className="text-xs text-teal">(vos)</span>}</span>
                  <span className="font-sora font-bold text-sm text-center">{e.points}</span>
                  <span className="text-xs text-center text-text-muted">{e.exact}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── GANADORES ─── */}
        {tab === "ganadores" && (
          <div className="px-4 py-6">
            <h2 className="font-sora font-bold text-2xl mb-1">Ganadores</h2>
            <p className="text-text-secondary text-sm mb-6">Los mejores de cada jornada y semana.</p>

            <div className="flex items-center gap-2 mb-3">
              <Crown size={16} className="text-gold" weight="fill" />
              <h3 className="font-sora font-semibold text-sm">Ganador semanal</h3>
            </div>
            <div className="bg-surface border border-gold/30 rounded-lg p-4 bg-gold/5 mb-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] text-text-muted uppercase tracking-wider mb-1">Semana 1 — 11 - 17 Jun</p>
                  <div className="flex items-center gap-2">
                    <UserAvatar src={null} name="Carlos López" size={24} />
                    <Crown size={16} weight="fill" className="text-gold" />
                    <span className="font-sora font-bold text-sm">Carlos López</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-sora font-extrabold text-xl text-gold">87</p>
                  <p className="text-[10px] text-text-muted">pts</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 mb-3">
              <Trophy size={16} className="text-teal" weight="fill" />
              <h3 className="font-sora font-semibold text-sm">Mejor del día</h3>
            </div>
            {[
              { date: "Lun 16 Jun", name: "María García", points: 30 },
              { date: "Dom 15 Jun", name: "Juan Pérez", points: 26 },
              { date: "Sab 14 Jun", name: "Carlos López", points: 23 },
            ].map(d => (
              <div key={d.date} className="bg-surface border border-border rounded-lg p-3 flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <UserAvatar src={null} name={d.name} size={24} />
                  <div>
                    <p className="font-grotesk font-semibold text-sm">{d.name}</p>
                    <p className="text-[10px] text-text-muted">{d.date}</p>
                  </div>
                </div>
                <span className="font-sora font-bold text-teal">{d.points} pts</span>
              </div>
            ))}
          </div>
        )}

        {/* ─── PREMIOS ─── */}
        {tab === "premios" && (
          <div className="px-4 py-6">
            <h2 className="font-sora font-bold text-2xl mb-1">Premios</h2>
            <p className="text-text-secondary text-sm mb-6">Conocé qué podés ganar.</p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              {DEMO_PRIZES.map(p => {
                const colors = { 1: "border-gold text-gold", 2: "border-mercedes-silver text-mercedes-silver", 3: "border-orange-400 text-orange-400" }[p.position] || "border-border text-text-muted";
                const labels = { 1: "1er Puesto", 2: "2do Puesto", 3: "3er Puesto" }[p.position] || "";
                return (
                  <div key={p.position} className={`bg-surface border-2 ${colors.split(" ")[0]} rounded-lg overflow-hidden`}>
                    <div className="aspect-[16/9] bg-surface-raised flex items-center justify-center">
                      <Trophy size={40} className={colors.split(" ")[1]} weight="fill" />
                    </div>
                    <div className="p-4 space-y-2">
                      <span className={`text-xs font-semibold uppercase tracking-wider ${colors.split(" ")[1]}`}>{labels}</span>
                      <h3 className="font-sora font-bold text-lg text-text-primary">{p.title}</h3>
                      <p className="font-grotesk text-sm text-text-secondary">{p.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ─── ADMIN ─── */}
        {tab === "admin" && (
          <div className="px-4 py-6">
            <h2 className="font-sora font-bold text-2xl mb-1">Panel Admin</h2>
            <p className="text-text-secondary text-sm mb-6">Vista previa del panel de administración.</p>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              {[
                { label: "Usuarios", value: "47", icon: Users, color: "text-teal" },
                { label: "Pronósticos", value: "1.240", icon: Target, color: "text-gold" },
                { label: "Jugados", value: "12", icon: SoccerBall, color: "text-success" },
                { label: "Pendientes", value: "60", icon: Trophy, color: "text-warning" },
              ].map(s => (
                <div key={s.label} className="bg-surface border border-border rounded-lg p-3">
                  <s.icon size={16} className={`${s.color} mb-1`} />
                  <p className={`font-sora font-bold text-xl ${s.color}`}>{s.value}</p>
                  <p className="text-[10px] text-text-muted">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Admin sections preview */}
            <div className="space-y-3">
              {[
                { icon: Users, label: "Usuarios y Equipos", desc: "Gestionar usuarios, asignar equipos y roles" },
                { icon: SoccerBall, label: "Partidos", desc: "Cargar resultados y sincronizar con API en vivo" },
                { icon: Gear, label: "Puntaje", desc: "Configurar puntos por resultado exacto, ganador, campeón" },
                { icon: Trophy, label: "Premios", desc: "Administrar premios con imágenes" },
                { icon: Crown, label: "Ganadores", desc: "Ver ganadores diarios y semanales automáticos" },
                { icon: ChartBar, label: "Reportes", desc: "Exportar rankings y estadísticas a Excel" },
                { icon: EnvelopeSimple, label: "Emails", desc: "Enviar recordatorios personalizados con diseño HTML" },
              ].map(s => (
                <div key={s.label} className="bg-surface border border-border rounded-lg p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-teal/10 flex items-center justify-center flex-shrink-0">
                    <s.icon size={18} className="text-teal" />
                  </div>
                  <div>
                    <p className="font-grotesk font-semibold text-sm text-text-primary">{s.label}</p>
                    <p className="text-[10px] text-text-muted">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Email preview */}
            <div className="mt-6">
              <p className="font-grotesk font-semibold text-xs text-text-muted uppercase tracking-wider mb-3">Preview de email de recordatorio</p>
              <div className="bg-[#0A1020] border border-border rounded-lg overflow-hidden">
                <div className="p-4 text-center border-b border-border/50">
                  <p className="text-[10px] text-text-muted mb-2">wave.brands</p>
                  <p className="font-sora font-bold text-sm"><span className="text-text-primary">Prode</span> <span className="text-teal">2026</span></p>
                  <p className="text-[20px] mt-1">🏆</p>
                </div>
                <div className="p-4">
                  <p className="text-text-primary text-sm font-semibold mb-1">¡Hola María!</p>
                  <p className="text-text-secondary text-xs mb-3">Tenés <span className="text-teal font-bold">3 partidos</span> sin pronosticar:</p>
                  <div className="space-y-1.5">
                    {["México vs Sudáfrica", "Argentina vs Argelia", "Brasil vs Marruecos"].map(m => (
                      <div key={m} className="bg-surface-raised rounded p-2 text-xs text-text-primary">{m}</div>
                    ))}
                  </div>
                  <div className="text-center mt-4">
                    <span className="inline-block bg-teal text-bg text-xs font-semibold px-6 py-2 rounded">⚽ Cargar pronósticos</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Demo footer CTA */}
      <div className="bg-surface border-t border-border px-4 py-6 text-center mt-8">
          <p className="font-sora font-bold text-lg text-text-primary mb-2">¿Te interesa para tu empresa?</p>
          <p className="text-text-secondary text-sm mb-4">Personalizamos la plataforma con tu marca y equipos internos.</p>
          <a
            href="mailto:gbuffa@wavebrands.com?subject=Consulta%20Prode%20Mundial%202026"
            className="inline-block bg-teal text-bg font-semibold text-sm px-8 py-3 rounded hover:bg-teal-dim transition-colors"
          >
            Contactanos
          </a>
      </div>
    </div>
  );
}
