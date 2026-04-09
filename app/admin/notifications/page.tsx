"use client";

import { useState, useEffect } from "react";
import { PaperPlaneTilt, CheckCircle, XCircle, SpinnerGap } from "@phosphor-icons/react";
import { createClient } from "@/lib/supabase/client";

interface ReminderLog {
  date: string;
  sent: number;
  matches: number;
}

export default function AdminNotificationsPage() {
  const [lastSent, setLastSent] = useState<ReminderLog | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("app_config")
      .select("value")
      .eq("key", "last_reminder_sent")
      .single()
      .then(({ data }) => {
        if (data?.value) {
          try {
            setLastSent(JSON.parse(data.value));
          } catch {
            // ignore parse errors
          }
        }
        setLoading(false);
      });
  }, []);

  async function handleSend() {
    setSending(true);
    setResult(null);

    try {
      const res = await fetch("/api/send-reminders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ test: true }),
      });
      const data = await res.json();

      if (data.error) {
        setResult({ success: false, message: data.error });
      } else if (data.sent === 0 && data.message) {
        setResult({ success: true, message: data.message });
      } else {
        setResult({
          success: true,
          message: `${data.sent} email${data.sent !== 1 ? "s" : ""} enviado${data.sent !== 1 ? "s" : ""} — ${data.matchesCount} partido${data.matchesCount !== 1 ? "s" : ""}${data.test ? " (modo test)" : ""}${data.sentTo ? " → " + data.sentTo.join(", ") : ""}`,
        });
        setLastSent({ date: new Date().toISOString(), sent: data.sent, matches: data.matchesCount });
      }
    } catch (err: any) {
      setResult({ success: false, message: err.message || "Error desconocido" });
    }

    setSending(false);
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleString("es-AR", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <div>
      <h2 className="font-sora font-bold text-lg mb-4">Configurar recordatorios</h2>

      <div className="bg-surface border border-border rounded-lg p-6 space-y-6">
        {/* Last sent info */}
        <div>
          <p className="text-text-muted text-xs uppercase tracking-wide mb-2">Último envío</p>
          {loading ? (
            <p className="text-text-secondary text-sm">Cargando...</p>
          ) : lastSent ? (
            <div className="text-sm space-y-1">
              <p className="text-text-primary">
                {formatDate(lastSent.date)}
              </p>
              <p className="text-text-secondary">
                {lastSent.sent} email{lastSent.sent !== 1 ? "s" : ""} enviado{lastSent.sent !== 1 ? "s" : ""} — {lastSent.matches} partido{lastSent.matches !== 1 ? "s" : ""}
              </p>
            </div>
          ) : (
            <p className="text-text-secondary text-sm">Nunca se enviaron recordatorios</p>
          )}
        </div>

        {/* Description */}
        <div>
          <p className="text-text-secondary text-sm">
            Envía un email de prueba a todos los usuarios con los próximos 4 partidos del fixture. En producción (durante el Mundial), enviará solo los partidos de mañana.
          </p>
        </div>

        {/* Send button */}
        <button
          onClick={handleSend}
          disabled={sending}
          className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold rounded bg-teal text-bg hover:bg-teal-dim transition-all disabled:opacity-60"
        >
          {sending ? (
            <>
              <SpinnerGap size={16} className="animate-spin" />
              Enviando...
            </>
          ) : (
            <>
              <PaperPlaneTilt size={16} weight="fill" />
              Enviar recordatorios ahora
            </>
          )}
        </button>

        {/* Result */}
        {result && (
          <div
            className={`flex items-start gap-2 p-3 rounded text-sm ${
              result.success
                ? "bg-success/10 text-success"
                : "bg-danger/10 text-danger"
            }`}
          >
            {result.success ? (
              <CheckCircle size={18} weight="fill" className="flex-shrink-0 mt-0.5" />
            ) : (
              <XCircle size={18} weight="fill" className="flex-shrink-0 mt-0.5" />
            )}
            <span>{result.message}</span>
          </div>
        )}
      </div>
    </div>
  );
}
