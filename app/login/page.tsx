"use client";

import Image from "next/image";
import { useState } from "react";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "@/src/lib/firebase";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const router = useRouter();

  const loginWithGoogle = async () => {
    setErrorMsg("");
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      router.push("./"); // tu home
    } catch (err: any) {
      const msg = String(err?.message || "");
      setErrorMsg(
        msg.includes("popup")
          ? "Se cerró la ventana de Google. Intenta de nuevo."
          : "No se pudo iniciar sesión. Revisa tu configuración o conexión."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid place-items-center px-6 py-10 bg-[radial-gradient(900px_500px_at_20%_10%,rgba(0,255,140,.15),transparent_60%),radial-gradient(700px_500px_at_80%_30%,rgba(0,255,140,.10),transparent_60%),linear-gradient(180deg,#07130f,#050b09)] text-emerald-50 relative overflow-hidden">
      <div className="absolute -left-32 -top-40 h-[420px] w-[420px] rounded-full blur-[40px] opacity-35 pointer-events-none bg-[radial-gradient(circle_at_30%_30%,rgba(0,255,140,.9),rgba(0,255,140,0))]" />
      <div className="absolute -right-40 -bottom-40 h-[420px] w-[420px] rounded-full blur-[40px] opacity-25 pointer-events-none bg-[radial-gradient(circle_at_30%_30%,rgba(0,255,140,.9),rgba(0,255,140,0))]" />

      <main className="w-full max-w-[520px] rounded-2xl border border-emerald-400/20 bg-emerald-950/40 backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,.55),0_0_40px_rgba(0,255,140,.10)] overflow-hidden">
        <header className="p-6 border-b border-emerald-400/15 flex items-center gap-4">
          <div className="relative h-16 w-16 shrink-0 rounded-xl overflow-hidden border border-emerald-400/20 bg-emerald-950/30">
            <Image src="/reto365_logo.jpg" alt="Reto 365/360" fill className="object-cover" />
          </div>

          <div>
            <h1 className="text-xl font-semibold tracking-tight">Reto 365</h1>
            <p className="text-sm text-emerald-100/70">Tu ahorro diario</p>
          </div>
        </header>

        <section className="p-6">
          <div className="inline-flex items-center gap-2 text-xs px-3 py-1 rounded-full border border-emerald-400/20 bg-emerald-950/40 text-emerald-100/80">
            Neon • Glass • Green
          </div>

          <h2 className="mt-4 text-2xl font-semibold">Inicia sesión</h2>
          <p className="mt-2 text-sm text-emerald-100/70">
            Entra con Google para guardar tu progreso y acceder desde cualquier dispositivo.
          </p>

          <button
            onClick={loginWithGoogle}
            disabled={loading}
            className="mt-5 w-full rounded-xl px-4 py-3 font-semibold border border-emerald-400/30 bg-emerald-500/10 hover:bg-emerald-500/15 transition
                       shadow-[0_0_0_1px_rgba(0,255,140,.08)_inset,0_0_25px_rgba(0,255,140,.12)]
                       disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Conectando..." : "Continuar con Google"}
          </button>

          {errorMsg ? <p className="mt-3 text-sm text-red-300">{errorMsg}</p> : null}

          <div className="mt-6 flex items-center gap-3 text-emerald-100/40">
            <span className="h-px flex-1 bg-emerald-400/15" />
            <span className="text-xs">o</span>
            <span className="h-px flex-1 bg-emerald-400/15" />
          </div>

          <button
            type="button"
            onClick={() => router.push("/")}
            className="mt-4 w-full rounded-xl px-4 py-3 font-semibold border border-emerald-400/20 bg-transparent hover:bg-emerald-950/30 transition"
          >
            Entrar en modo demo
          </button>
        </section>
      </main>
    </div>
  );
}
