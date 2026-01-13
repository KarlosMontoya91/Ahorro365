"use client";

import React from "react";
import { useAuth } from "@/src/components/AuthProvider";
import LoginScreen from "@/src/components/LoginScreen";

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-dvh grid place-items-center app-shell-bg">
        <div className="glass neon-outline card-radius px-5 py-4 text-center">
          <div className="inline-flex items-center gap-2 pill px-3 py-1 bg-white/5 border border-white/10">
            <span className="h-2 w-2 rounded-full bg-[hsl(var(--primary))]" />
            <span className="text-sm text-muted-foreground">Cargando sesión...</span>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">Espera un momento</p>
        </div>
      </div>
    );
  }

  if (!user) return <LoginScreen />;

  return <>{children}</>;
}
