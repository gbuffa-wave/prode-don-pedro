"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  Trophy, SoccerBall, Crown, Star, Medal, Target, Calendar,
  CaretDown, CaretUp, GearSix, Users, Gear, ChartBar,
  EnvelopeSimple, FunnelSimple,
} from "@phosphor-icons/react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import confetti from "canvas-confetti";
import Countdown from "@/components/Countdown";
import PredictionForm from "@/components/PredictionForm";
import ChampionPicker from "@/components/ChampionPicker";
import ScoringInfo from "@/components/ScoringInfo";
import UserAvatar from "@/components/UserAvatar";
import { useToast } from "@/components/Toast";
import type { Team } from "@/lib/types";

// ─── Mock data ───
const DEMO_USER = { name: "Maria Garcia", avatar: null, team: "Comunicacion" };

const DEMO_LEADERBOARD = [
  { rank: 1, name: "Carlos Lopez", points: 87, exact: 6, avatar: null, team: "Comunicacion" },
  { rank: 2, name: "Maria Garcia", points: 82, exact: 5, avatar: null, team: "Comunicacion" },
  { rank: 3, name: "Juan Perez", points: 78, exact: 4, avatar: null, team: "Waveteam" },
  { rank: 4, name: "Ana Martinez", points: 71, exact: 3, avatar: null, team: "Waveteam" },
  { rank: 5, name: "Diego Ruiz", points: 65, exact: 3, avatar: null, team: "Comunicacion" },
  { rank: 6, name: "Lucia Fernandez", points: 59, exact: 2, avatar: null, team: "Diseno" },
  { rank: 7, name: "Pablo Torres", points: 54, exact: 2, avatar: null, team: "Diseno" },
  { rank: 8, name: "Valentina Sosa", points: 48, exact: 1, avatar: null, team: "Waveteam" },
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

const TABS: { key: DemoTab; label: string; icon: typeof SoccerBall }[] = [
  { key: "fixture", label: "Fixture", icon: SoccerBall },
  { key: "ranking", label: "Ranking", icon: Trophy },
  { key: "ganadores", label: "Ganadores", icon: Crown },
  { key: "premios", label: "Premios", icon: Medal },
  { key: "admin", label: "Admin", icon: GearSix },
];

export default function DemoPage() {
  const [tab, setTab] = useState<DemoTab>("fixture");
  const [matches, setMatches] = useState<any[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [predictions, setPredictions] = useState<Record<number, { home: number; away: number }>>({});
  const [teamFilter, setTeamFilter] = useState<string | null>(null);
  const { showToast } = useToast();

  // Fetch matches and teams from Supabase
  useEffect(() => {
    const supabase = createClient();
    Promise.all([
      supabase
        .from("matches")
        .select("*, home_team:teams!home_team_id(*), away_team:teams!away_team_id(*)")
        .order("match_date")
        .limit(10),
      supabase
        .from("teams")
        .select("*")
        .order("name"),
    ]).then(([matchRes, teamRes]) => {
      setMatches(matchRes.data || []);
      setTeams(teamRes.data || []);
      setLoading(false);
    });
  }, []);

  // Tab-switch confetti
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

  const handlePredictionSubmit = useCallback((matchId: number, homeScore: number, awayScore: number) => {
    setPredictions(prev => ({ ...prev, [matchId]: { home: homeScore, away: awayScore } }));
  }, []);

  // Prepare matches: first one is "live", rest are scheduled
  const liveMatch = matches[0] || null;
  const scheduledMatches = matches.slice(1, 7);

  // Ranking filter
  const allTeams = [...new Set(DEMO_LEADERBOARD.map(e => e.team))];
  const filteredLeaderboard = teamFilter
    ? DEMO_LEADERBOARD.filter(e => e.team === teamFilter)
    : DEMO_LEADERBOARD;

  return (
    <div className="min-h-dvh">
      {/* Demo banner */}
      <div className="bg-gold/10 border-b border-gold/30 px-4 py-2 text-center">
        <span className="text-gold text-xs font-semibold uppercase tracking-wider">
          Modo Demo — Vista previa de la plataforma
        </span>
      </div>

      {/* ─── DESKTOP NAV (md+) ─── */}
      <nav className="hidden md:block bg-bg/95 backdrop-blur-md border-b border-border">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          {/* Logo left */}
          <div className="flex items-center gap-3">
            <Image
              src="/logo-wave.png"
              alt="Wave Brands"
              width={60}
              height={17}
              className="h-3.5 w-auto object-contain"
            />
            <div className="h-5 w-px bg-border" />
            <span className="font-sora font-bold text-lg tracking-tight">
              <span className="text-text-primary">Prode</span>
              <span className="text-teal ml-1">2026</span>
            </span>
          </div>

          {/* Tabs center */}
          <div className="flex items-center gap-1">
            {TABS.map(({ key, label, icon: Icon }) => {
              const active = tab === key;
              return (
                <button
                  key={key}
                  onClick={() => setTab(key)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                    active
                      ? key === "admin" ? "bg-gold/10 text-gold" : "bg-teal/10 text-teal"
                      : "text-text-secondary hover:text-text-primary"
                  }`}
                >
                  <Icon size={16} weight={active ? "fill" : "regular"} />
                  <span>{label}</span>
                </button>
              );
            })}
          </div>

          {/* Avatar right */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-muted">{DEMO_USER.name}</span>
            <UserAvatar src={null} name={DEMO_USER.name} size={28} />
          </div>
        </div>
      </nav>

      {/* ─── MOBILE NAV (<md) ─── */}
      <nav className="md:hidden bg-bg/95 backdrop-blur-md border-b border-border">
        {/* Logo row */}
        <div className="flex items-center justify-between px-4 h-11">
          <div className="flex items-center gap-2">
            <Image
              src="/logo-wave.png"
              alt="Wave Brands"
              width={45}
              height={13}
              className="h-2.5 w-auto object-contain"
            />
            <div className="h-3 w-px bg-border" />
            <span className="font-sora font-bold text-xs tracking-tight">
              <span className="text-text-primary">Prode</span>
              <span className="text-teal ml-1">2026</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-text-muted">{DEMO_USER.name}</span>
            <UserAvatar src={null} name={DEMO_USER.name} size={22} />
          </div>
        </div>
        {/* Tab row */}
        <div className="flex items-center justify-around h-10 border-t border-border/50">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex items-center gap-1 px-2 py-1 rounded transition-colors ${
                tab === key ? "text-teal" : "text-text-muted"
              }`}
            >
              <Icon size={14} weight={tab === key ? "fill" : "regular"} />
              <span className="text-[10px] font-semibold">{label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* ─── CONTENT ─── */}
      <div className="max-w-3xl mx-auto">

        {/* ═══════════════ FIXTURE ═══════════════ */}
        {tab === "fixture" && (
          <div>
            {/* Hero */}
            <div className="relative overflow-hidden bg-surface border-b border-border">
              <img src="/hero-banner.png" alt="" className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/60 to-transparent" />
              <div className="relative z-10 px-4 pt-8 pb-10">
                <p className="font-grotesk font-semibold text-[10px] text-teal tracking-widest uppercase mb-3">
                  Mundial 2026
                </p>
                <h1 className="font-sora font-extrabold text-3xl md:text-5xl tracking-tightest leading-none mb-3">
                  Prode <span className="text-teal">2026</span>
                </h1>
                <p className="font-grotesk text-sm text-text-secondary max-w-md">
                  Pronostica los resultados de cada partido y competi con tus companeros.
                </p>
                <div className="mt-6">
                  <p className="text-[10px] text-text-muted uppercase tracking-wider mb-2">Comienza en</p>
                  <Countdown targetDate="2026-06-11T17:00:00Z" />
                </div>
              </div>
            </div>

            {/* Champion picker + Scoring info + Matches */}
            <div className="px-4 py-6">
              {/* Champion Picker */}
              <ChampionPicker teams={teams} />

              {/* Scoring Info */}
              <ScoringInfo />

              {/* Live match */}
              {liveMatch && (
                <div className="mb-4">
                  <p className="font-grotesk font-semibold text-xs text-success uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                    En vivo
                  </p>
                  <div className="bg-surface border-2 rounded-lg p-3 pulse-live">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] text-text-muted uppercase tracking-wider">
                        Grupo {liveMatch.group_label}
                      </span>
                      <span className="text-[10px] font-bold text-success bg-success/10 px-2 py-0.5 rounded-full uppercase">
                        EN VIVO
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 flex-1">
                        <img
                          src={liveMatch.home_team?.flag_url}
                          alt=""
                          className="w-7 h-4 object-cover rounded-sm"
                        />
                        <span className="font-grotesk font-medium text-sm">{liveMatch.home_team?.name}</span>
                      </div>
                      <div className="flex items-center gap-2 mx-3">
                        <div className="w-10 h-10 bg-bg border border-border rounded flex items-center justify-center font-sora font-bold text-lg text-success">
                          1
                        </div>
                        <span className="text-text-muted text-xs">-</span>
                        <div className="w-10 h-10 bg-bg border border-border rounded flex items-center justify-center font-sora font-bold text-lg text-success">
                          0
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-1 justify-end">
                        <span className="font-grotesk font-medium text-sm text-right">
                          {liveMatch.away_team?.name}
                        </span>
                        <img
                          src={liveMatch.away_team?.flag_url}
                          alt=""
                          className="w-7 h-4 object-cover rounded-sm"
                        />
                      </div>
                    </div>
                    <div className="mt-2 text-center">
                      <span className="text-[10px] text-text-muted">Min 67&apos;</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Scheduled matches with prediction forms */}
              <p className="font-grotesk font-semibold text-xs text-teal uppercase tracking-wider mb-3">
                Proximos partidos
              </p>
              {loading ? (
                <p className="text-text-muted text-sm text-center py-8">Cargando...</p>
              ) : (
                <div className="space-y-2">
                  {scheduledMatches.map((m: any) => (
                    <div key={m.id} className="bg-surface border border-border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] text-text-muted uppercase tracking-wider">
                          Grupo {m.group_label}
                        </span>
                        <span className="text-[10px] text-warning font-medium">
                          {new Date(m.match_date).toLocaleDateString("es-AR", {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <img
                            src={m.home_team?.flag_url}
                            alt=""
                            className="w-7 h-4 object-cover rounded-sm flex-shrink-0"
                          />
                          <span className="font-grotesk font-medium text-sm truncate">
                            {m.home_team?.name}
                          </span>
                        </div>
                        <div className="flex-shrink-0 mx-1">
                          <PredictionForm
                            matchId={m.id}
                            existingHome={predictions[m.id]?.home}
                            existingAway={predictions[m.id]?.away}
                            onSubmit={handlePredictionSubmit}
                          />
                        </div>
                        <div className="flex items-center gap-2 flex-1 justify-end min-w-0">
                          <span className="font-grotesk font-medium text-sm text-right truncate">
                            {m.away_team?.name}
                          </span>
                          <img
                            src={m.away_team?.flag_url}
                            alt=""
                            className="w-7 h-4 object-cover rounded-sm flex-shrink-0"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ═══════════════ RANKING ═══════════════ */}
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
                    <span className="font-grotesk text-xs font-medium text-center mt-1 truncate w-full">
                      {entry.name}
                    </span>
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

            {/* Team filter buttons */}
            <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1">
              <FunnelSimple size={14} className="text-text-muted flex-shrink-0" />
              <button
                onClick={() => setTeamFilter(null)}
                className={`text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap transition-colors ${
                  teamFilter === null ? "bg-teal/15 text-teal" : "bg-surface border border-border text-text-muted hover:text-text-primary"
                }`}
              >
                Todos
              </button>
              {allTeams.map(t => (
                <button
                  key={t}
                  onClick={() => setTeamFilter(t)}
                  className={`text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap transition-colors ${
                    teamFilter === t ? "bg-teal/15 text-teal" : "bg-surface border border-border text-text-muted hover:text-text-primary"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* Table */}
            <div className="bg-surface border border-border rounded-lg overflow-hidden">
              <div className="grid grid-cols-[3rem_1fr_4rem_4rem] gap-2 px-4 py-3 bg-surface-raised text-xs text-text-muted font-semibold uppercase tracking-wider">
                <span>#</span>
                <span>Jugador</span>
                <span className="text-center">Pts</span>
                <span className="text-center">Exacto</span>
              </div>
              {filteredLeaderboard.slice(3).map((e) => (
                <div
                  key={e.rank}
                  className={`grid grid-cols-[3rem_1fr_4rem_4rem] gap-2 px-4 py-3 border-t border-border items-center ${
                    e.name === DEMO_USER.name ? "bg-teal/5 border-l-2 border-l-teal" : ""
                  }`}
                >
                  <span className="font-sora font-bold text-sm text-text-secondary">{e.rank}</span>
                  <div className="flex items-center gap-2 min-w-0">
                    <UserAvatar src={null} name={e.name} size={24} />
                    <span className="font-grotesk text-sm text-text-primary truncate">
                      {e.name}
                      {e.name === DEMO_USER.name && (
                        <span className="text-xs text-teal ml-1">(vos)</span>
                      )}
                    </span>
                  </div>
                  <span className="font-sora font-bold text-sm text-center">{e.points}</span>
                  <span className="text-xs text-center text-text-muted">{e.exact}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ═══════════════ GANADORES ═══════════════ */}
        {tab === "ganadores" && (
          <div className="px-4 py-6">
            <h2 className="font-sora font-bold text-2xl mb-1">Ganadores</h2>
            <p className="text-text-secondary text-sm mb-6">Los mejores de cada jornada y semana.</p>

            {/* Weekly winner */}
            <div className="flex items-center gap-2 mb-3">
              <Crown size={16} className="text-gold" weight="fill" />
              <h3 className="font-sora font-semibold text-sm">Ganador semanal</h3>
            </div>
            <div className="bg-surface border border-gold/30 rounded-lg p-4 bg-gold/5 mb-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] text-text-muted uppercase tracking-wider mb-1">
                    Semana 1 — 11 - 17 Jun
                  </p>
                  <div className="flex items-center gap-2">
                    <UserAvatar src={null} name="Carlos Lopez" size={24} />
                    <Crown size={16} weight="fill" className="text-gold" />
                    <span className="font-sora font-bold text-sm">Carlos Lopez</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-sora font-extrabold text-xl text-gold">87</p>
                  <p className="text-[10px] text-text-muted">pts</p>
                </div>
              </div>
            </div>

            {/* Daily winners */}
            <div className="flex items-center gap-2 mb-3">
              <Trophy size={16} className="text-teal" weight="fill" />
              <h3 className="font-sora font-semibold text-sm">Mejor del dia</h3>
            </div>
            {[
              { date: "Lun 16 Jun", name: "Maria Garcia", points: 30 },
              { date: "Dom 15 Jun", name: "Juan Perez", points: 26 },
              { date: "Sab 14 Jun", name: "Carlos Lopez", points: 23 },
            ].map((d) => (
              <div
                key={d.date}
                className="bg-surface border border-border rounded-lg p-3 flex items-center justify-between mb-2"
              >
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

        {/* ═══════════════ PREMIOS ═══════════════ */}
        {tab === "premios" && (
          <div className="px-4 py-6">
            <h2 className="font-sora font-bold text-2xl mb-1">Premios</h2>
            <p className="text-text-secondary text-sm mb-6">Conoce que podes ganar.</p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              {DEMO_PRIZES.map((p) => {
                const colors =
                  { 1: "border-gold text-gold", 2: "border-mercedes-silver text-mercedes-silver", 3: "border-orange-400 text-orange-400" }[
                    p.position
                  ] || "border-border text-text-muted";
                const labels = { 1: "1er Puesto", 2: "2do Puesto", 3: "3er Puesto" }[p.position] || "";
                return (
                  <div key={p.position} className={`bg-surface border-2 ${colors.split(" ")[0]} rounded-lg overflow-hidden`}>
                    <div className="aspect-[16/9] bg-surface-raised flex items-center justify-center">
                      <Trophy size={40} className={colors.split(" ")[1]} weight="fill" />
                    </div>
                    <div className="p-4 space-y-2">
                      <span className={`text-xs font-semibold uppercase tracking-wider ${colors.split(" ")[1]}`}>
                        {labels}
                      </span>
                      <h3 className="font-sora font-bold text-lg text-text-primary">{p.title}</h3>
                      <p className="font-grotesk text-sm text-text-secondary">{p.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ═══════════════ ADMIN ═══════════════ */}
        {tab === "admin" && (
          <div className="px-4 py-6">
            <h2 className="font-sora font-bold text-2xl mb-1">Panel Admin</h2>
            <p className="text-text-secondary text-sm mb-6">Vista previa del panel de administracion.</p>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              {[
                { label: "Usuarios", value: "47", icon: Users, color: "text-teal" },
                { label: "Pronosticos", value: "1.240", icon: Target, color: "text-gold" },
                { label: "Jugados", value: "12", icon: SoccerBall, color: "text-success" },
                { label: "Pendientes", value: "60", icon: Trophy, color: "text-warning" },
              ].map((s) => (
                <div key={s.label} className="bg-surface border border-border rounded-lg p-3">
                  <s.icon size={16} className={`${s.color} mb-1`} />
                  <p className={`font-sora font-bold text-xl ${s.color}`}>{s.value}</p>
                  <p className="text-[10px] text-text-muted">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Feature list */}
            <div className="space-y-3">
              {[
                { icon: Users, label: "Usuarios y Equipos", desc: "Gestionar usuarios, asignar equipos y roles" },
                { icon: SoccerBall, label: "Partidos", desc: "Cargar resultados y sincronizar con API en vivo" },
                { icon: Gear, label: "Puntaje", desc: "Configurar puntos por resultado exacto, ganador, campeon" },
                { icon: Trophy, label: "Premios", desc: "Administrar premios con imagenes" },
                { icon: Crown, label: "Ganadores", desc: "Ver ganadores diarios y semanales automaticos" },
                { icon: ChartBar, label: "Reportes", desc: "Exportar rankings y estadisticas a Excel" },
                { icon: EnvelopeSimple, label: "Emails", desc: "Enviar recordatorios personalizados con diseno HTML" },
              ].map((s) => (
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
              <p className="font-grotesk font-semibold text-xs text-text-muted uppercase tracking-wider mb-3">
                Preview de email de recordatorio
              </p>
              <div className="bg-[#0A1020] border border-border rounded-lg overflow-hidden">
                {/* Header */}
                <div className="p-5 text-center border-b-2 border-teal" style={{ backgroundColor: "#0A1020" }}>
                  <img src="/logo-wave.png" alt="" className="h-[14px] w-auto mx-auto mb-3 opacity-80" />
                  <p className="font-sora font-bold text-lg">
                    <span className="text-text-primary">Prode</span>{" "}
                    <span className="text-teal">2026</span>
                  </p>
                  <img src="/copa-mundial.png" alt="" className="h-[50px] w-auto mx-auto my-3" />
                  <p className="text-text-muted text-[10px] uppercase tracking-widest">Mundial FIFA 2026</p>
                </div>
                {/* Body */}
                <div className="p-4" style={{ backgroundColor: "#0A0A0A" }}>
                  <p className="text-text-primary text-base font-bold mb-1">¡Hola María!</p>
                  <p className="text-text-secondary text-sm mb-4">
                    Tenés <span className="text-teal font-bold">3 partidos</span> sin pronosticar. ¡No te quedes afuera!
                  </p>
                  {/* Match cards with flags */}
                  {[
                    { home: "México", hCode: "mx", away: "Sudáfrica", aCode: "za", group: "A", date: "Jue 11 Jun, 14:00" },
                    { home: "Argentina", hCode: "ar", away: "Argelia", aCode: "dz", group: "J", date: "Lun 16 Jun, 22:00" },
                    { home: "Brasil", hCode: "br", away: "Marruecos", aCode: "ma", group: "C", date: "Vie 13 Jun, 19:00" },
                  ].map((m) => (
                    <div key={m.home} className="bg-surface-raised rounded-lg p-3 mb-2">
                      <p className="text-text-muted text-[9px] uppercase tracking-wider mb-2">
                        Grupo {m.group} — {m.date}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 flex-1 justify-end pr-2">
                          <span className="text-text-primary text-xs font-semibold">{m.home}</span>
                          <img src={`https://flagcdn.com/w40/${m.hCode}.png`} alt="" className="w-5 h-3 rounded-sm object-cover" />
                        </div>
                        <span className="text-text-muted text-[10px] font-bold px-2">vs</span>
                        <div className="flex items-center gap-2 flex-1 pl-2">
                          <img src={`https://flagcdn.com/w40/${m.aCode}.png`} alt="" className="w-5 h-3 rounded-sm object-cover" />
                          <span className="text-text-primary text-xs font-semibold">{m.away}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="text-center mt-5 mb-2">
                    <span className="inline-block bg-teal text-white text-xs font-bold px-8 py-2.5 rounded-lg">
                      ⚽ Cargar pronósticos
                    </span>
                  </div>
                  <p className="text-text-muted text-[10px] text-center mt-3">
                    Si ya cargaste todos, ignorá este email.
                  </p>
                </div>
                {/* Footer */}
                <div className="p-3 text-center border-t border-border">
                  <p className="text-[9px] text-text-muted uppercase tracking-wider">Prode Mundial 2026 — Wave Brands</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Demo footer CTA */}
      <div className="bg-surface border-t border-border px-4 py-6 text-center mt-8">
        <p className="font-sora font-bold text-lg text-text-primary mb-2">Te interesa para tu empresa?</p>
        <p className="text-text-secondary text-sm mb-4">
          Personalizamos la plataforma con tu marca y equipos internos.
        </p>
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
