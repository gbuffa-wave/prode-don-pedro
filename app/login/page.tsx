"use client";

import Image from "next/image";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { brand } from "@/lib/brand";

type Tab = "google" | "email";
type EmailMode = "login" | "register";

export default function LoginPage() {
  const [tab, setTab] = useState<Tab>("google");
  const [mode, setMode] = useState<EmailMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleGoogleLogin() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  }

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const supabase = createClient();

    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError("Email o contraseña incorrectos.");
      } else {
        window.location.href = "/fixture";
      }
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: name },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) {
        setError(error.message === "User already registered"
          ? "Ya existe una cuenta con ese email."
          : "No se pudo crear la cuenta. Intentá de nuevo.");
      } else {
        setSuccess("¡Cuenta creada! Revisá tu email para confirmar y luego ingresá.");
      }
    }

    setLoading(false);
  }

  return (
    <div className="min-h-[calc(100dvh-3.5rem)] flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm space-y-8 text-center">
        <div>
          <Image
            src={brand.logoSrc}
            alt={brand.logoAlt}
            width={100}
            height={28}
            className="h-6 w-auto object-contain mx-auto mb-6"
            priority
          />
          <h1 className="font-sora font-extrabold text-4xl tracking-tightest mb-2">
            {brand.title} <span className="text-teal">{brand.year}</span>
          </h1>
          <p className="font-grotesk text-sm text-text-secondary">
            Ingresá para pronosticar y competir
          </p>
        </div>

        {/* Tabs */}
        <div className="flex rounded-lg bg-surface border border-border p-1 gap-1">
          <button
            onClick={() => setTab("google")}
            className={`flex-1 py-2 text-xs font-semibold rounded transition-colors ${
              tab === "google" ? "bg-teal text-bg" : "text-text-secondary hover:text-text-primary"
            }`}
          >
            Google
          </button>
          <button
            onClick={() => setTab("email")}
            className={`flex-1 py-2 text-xs font-semibold rounded transition-colors ${
              tab === "email" ? "bg-teal text-bg" : "text-text-secondary hover:text-text-primary"
            }`}
          >
            Email
          </button>
        </div>

        {/* Google tab */}
        {tab === "google" && (
          <button
            onClick={handleGoogleLogin}
            className="w-full font-grotesk font-semibold text-sm px-6 py-3 bg-teal text-bg rounded hover:bg-teal-dim transition-colors flex items-center justify-center gap-3"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Ingresar con Google
          </button>
        )}

        {/* Email tab */}
        {tab === "email" && (
          <form onSubmit={handleEmailSubmit} className="space-y-3 text-left">
            {mode === "register" && (
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">Nombre completo</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Juan Pérez"
                  className="w-full bg-surface border border-border rounded px-3 py-2.5 text-sm focus:border-teal focus:outline-none"
                />
              </div>
            )}
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="juan@ejemplo.com"
                className="w-full bg-surface border border-border rounded px-3 py-2.5 text-sm focus:border-teal focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                placeholder="Mínimo 6 caracteres"
                className="w-full bg-surface border border-border rounded px-3 py-2.5 text-sm focus:border-teal focus:outline-none"
              />
            </div>

            {error && <p className="text-xs text-red-400">{error}</p>}
            {success && <p className="text-xs text-teal">{success}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full font-grotesk font-semibold text-sm px-6 py-3 bg-teal text-bg rounded hover:bg-teal-dim transition-colors disabled:opacity-50"
            >
              {loading ? "..." : mode === "login" ? "Ingresar" : "Crear cuenta"}
            </button>

            <p className="text-xs text-text-muted text-center pt-1">
              {mode === "login" ? (
                <>¿No tenés cuenta?{" "}
                  <button type="button" onClick={() => { setMode("register"); setError(null); setSuccess(null); }} className="text-teal hover:underline">
                    Registrate
                  </button>
                </>
              ) : (
                <>¿Ya tenés cuenta?{" "}
                  <button type="button" onClick={() => { setMode("login"); setError(null); setSuccess(null); }} className="text-teal hover:underline">
                    Ingresá
                  </button>
                </>
              )}
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
