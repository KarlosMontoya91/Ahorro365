// Archivo: src/lib/types.ts

export type SavingsRecord = {
  id: string;          // <--- IMPORTANTE: Esto arregla el error 1
  date: string;
  amount: number;
  type: "deposit" | "withdrawal";
  note?: string;
  goalId?: string;     // <--- IMPORTANTE: Esto arregla el error 2 (vínculo con metas)
};

export type Goal = {
  id: string;
  name: string;
  amount: number;
  current: number;
  icon?: string;       // <--- Esto permite guardar iconos
  color?: string;      // <--- Esto permite guardar colores
  deadline?: string;
};