"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  GoogleAuthProvider,
  getRedirectResult,
  setPersistence,
  browserLocalPersistence,
  signInWithPopup,
  signInWithRedirect,
} from "firebase/auth";
import { auth } from "@/src/lib/firebase";
import { Button } from "@/components/ui/button";

function friendlyAuthError(code?: string) {
  switch (code) {
    case "auth/network-request-failed":
      return "No se pudo conectar con Google/Firebase. Revisa tu internet, bloqueadores (Brave/AdBlock) y que tu dominio esté autorizado en Firebase (karlosmontoya91.github.io).";
    case "auth/popup-blocked":
      return "Tu navegador bloqueó el popup. Intentaré abrir el login por redirección.";
    case "auth/popup-closed-by-user":
      return "Cerraste la ventana de login antes de terminar.";
    case "auth/unauthorized-domain":
      return "Dominio no autorizado. Agrega karlosmontoya91.github.io en Firebase → Authentication → Authorized domains.";
    case "auth/cancelled-popup-request":
      return "Se canceló el popup anterior. Intenta de nuevo.";
    default:
      return "No se pudo iniciar sesión. Intenta de nuevo.";
  }
}

export default function LoginScreen() {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string>("");

  const provider = useMemo(() => {
    const p = new GoogleAuthProvider();
    // ✅ fuerza selector de cuenta siempre (sirve para “cambiar cuenta”)
    p.setCustomParameters({ prompt: "select_account" });
    return p;
  }, []);

  // ✅ si alguna vez caíste a signInWithRedirect, aquí se finaliza el login
  useEffect(() => {
    getRedirectResult(auth).catch((err: any) => {
      // Solo mostramos error si realmente hay uno (no siempre hay redirect)
      if (err?.code) setErrorMsg(friendlyAuthError(err.code));
    });
  }, []);

  const handleGoogleLogin = async () => {
    setErrorMsg("");
    setLoading(true);

    try {
      // ✅ persistencia para que no se “pierda” la sesión en refresh
      await setPersistence(auth, browserLocalPersistence);

      // 1) intenta popup
      await signInWithPopup(auth, provider);
      // si funciona, AuthGate detecta user y entra a la app
    } catch (err: any) {
      const code = err?.code as string | undefined;

      // Si el popup fue bloqueado o hubo bronca de popup, caemos a redirect
      if (code === "auth/popup-blocked" || code === "auth/cancelled-popup-request") {
        try {
          setErrorMsg(friendlyAuthError(code));
          await signInWithRedirect(auth, provider);
          return;
        } catch (err2: any) {
          setErrorMsg(friendlyAuthError(err2?.code));
        }
      } else {
        setErrorMsg(friendlyAuthError(code));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh grid place-items-center app-shell-bg px-4">
      <div className="w-full max-w-md glass neon-outline card-radius p-6">
        <div className="mb-4">
          <p className="text-xs text-muted-foreground">Reto 365</p>
          <h1 className="text-2xl font-black">Inicia sesión</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Accede con Google para sincronizar tu progreso.
          </p>
        </div>

        <Button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full pill font-semibold bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Conectando..." : "Continuar con Google"}
        </Button>

        {errorMsg ? (
          <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 p-3">
            <p className="text-sm text-red-200">{errorMsg}</p>
          </div>
        ) : null}

        {/* <div className="mt-4 text-xs text-muted-foreground">
          <p>
            Si estás en GitHub Pages: verifica en Firebase que esté autorizado{" "}
            <span className="text-[hsl(var(--primary))]">karlosmontoya91.github.io</span>.
          </p>
        </div> */}
      </div>
    </div>
  );
}
