export default function LoginPage() {
  return (
    <div className="min-h-[calc(100dvh-3.5rem)] flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm space-y-8 text-center">
        <div>
          <h1 className="font-sora font-extrabold text-4xl tracking-tightest mb-2">
            Prode <span className="text-teal">2026</span>
          </h1>
          <p className="font-grotesk text-sm text-text-secondary">
            Ingresa con tu cuenta corporativa
          </p>
        </div>
        <button
          className="w-full font-grotesk font-semibold text-sm px-6 py-3 bg-teal text-bg rounded hover:bg-teal-dim transition-colors flex items-center justify-center gap-2"
        >
          Iniciar sesion con SSO
        </button>
        <p className="text-xs text-text-muted">
          Solo empleados autorizados de Mercedes-Benz
        </p>
      </div>
    </div>
  );
}
