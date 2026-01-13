"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { signOut } from "firebase/auth";
import { auth } from "@/src/lib/firebase";
import { useAuth } from "@/src/components/AuthProvider";

import {
    ArrowDownRight,
    ArrowUpLeft,
    BarChart2,
    Camera,
    ChevronLeft,
    HelpCircle,
    History,
    Lightbulb,
    Menu,
    Pencil,
    Percent,
    Plus,
    Tags,
    Target,
    Trophy,
    User,
    Wallet,
} from "lucide-react";

import { personalizedSavingsTips, type PersonalizedSavingsTipsOutput } from "@/src/ai/flows/personalized-savings-tips";
import type { Goal, SavingsRecord } from "@/src/lib/types";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bar, BarChart, CartesianGrid, Line, LineChart, Tooltip, XAxis, YAxis } from "recharts";
import { ChartConfig, ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const TOTAL_DAYS = 365;

const goalColors = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
];

const SplashScreen = () => (
    <div className="fixed inset-0 z-50 grid place-items-center app-shell-bg">
        <div className="text-center animate-zoomIn">
            <div className="inline-flex items-center gap-2 pill px-4 py-2 glass neon-outline mb-6">
                <span className="h-2 w-2 rounded-full bg-[hsl(var(--primary))]" />
                <span className="text-sm text-muted-foreground">Reto 365</span>
            </div>
            <h1 className="text-6xl font-extrabold tracking-tight">Reto</h1>
            <h1 className="text-[10rem] sm:text-[12rem] font-black leading-none text-[hsl(var(--primary))] drop-shadow">
                365
            </h1>
            <p className="text-lg text-muted-foreground">Tu ahorro diario</p>
        </div>
        <style jsx>{`
      @keyframes zoomIn {
        from {
          opacity: 0;
          transform: scale(0.92);
        }
        to {
          opacity: 1;
          transform: scale(1);
        }
      }
      .animate-zoomIn {
        animation: zoomIn 0.9s ease;
      }
    `}</style>
    </div>
);

function SavingsHistoryList({
    history,
    onSavePostponed,
}: {
    history: SavingsRecord[];
    onSavePostponed: (day: number) => void;
}) {
    if (history.length === 0) return <p className="text-center text-muted-foreground py-8">Aún no hay registros.</p>;

    return (
        <div className="space-y-3">
            {history.map((item) => (
                <div key={item.day} className="glass card-radius p-3 flex items-center gap-3">
                    <div
                        className={`h-11 w-11 rounded-2xl grid place-items-center border
            ${item.saved
                                ? "bg-[rgba(162,227,147,0.12)] border-[rgba(162,227,147,0.18)] text-[rgb(162,227,147)]"
                                : "bg-[rgba(255,80,80,0.10)] border-[rgba(255,80,80,0.16)] text-[rgb(255,120,120)]"
                            }`}
                    >
                        {item.saved ? <ArrowDownRight className="w-5 h-5" /> : <ArrowUpLeft className="w-5 h-5" />}
                    </div>

                    <div className="flex-1 min-w-0">
                        <p className="font-semibold truncate">
                            {item.saved ? "Ahorro" : "Pospuesto"} <span className="text-muted-foreground">· Día {item.day}</span>
                        </p>
                        <p className="text-xs text-muted-foreground">{new Date(item.date).toLocaleDateString()}</p>
                    </div>

                    <div className="flex items-center gap-2">
                        <p className={`font-black text-lg tabular-nums ${item.saved ? "text-[rgb(162,227,147)]" : "text-[rgb(255,120,120)]"}`}>
                            ${item.value}
                        </p>
                        {!item.saved ? (
                            <Button
                                size="sm"
                                variant="outline"
                                className="pill border-white/15 bg-white/5 hover:bg-white/10"
                                onClick={() => onSavePostponed(item.day)}
                            >
                                Ahorrar
                            </Button>
                        ) : null}
                    </div>
                </div>
            ))}
        </div>
    );
}

function PersonalizedTip({ history, trigger }: { history: SavingsRecord[]; trigger: number }) {
    const [tipData, setTipData] = useState<PersonalizedSavingsTipsOutput | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const [show, setShow] = useState(false);

    useEffect(() => {
        if (trigger > 0 && history.length > 0) {
            const saved = history.filter((r) => r.saved);
            const postponed = history.filter((r) => !r.saved);

            const fetchTip = async () => {
                setLoading(true);
                setError(null);
                try {
                    const data = await personalizedSavingsTips({
                        savingsHistory: JSON.stringify(saved),
                        postponedAmounts: JSON.stringify(postponed.map((p) => p.value)),
                    });
                    setTipData(data);
                    setShow(true);
                } catch (e) {
                    setError(e as Error);
                    setShow(false);
                } finally {
                    setLoading(false);
                }
            };

            fetchTip();
        }
    }, [trigger, history]);

    useEffect(() => {
        if (show) {
            const timer = setTimeout(() => setShow(false), 8000);
            return () => clearTimeout(timer);
        }
    }, [show]);

    if (!show || loading || error || !tipData) return null;

    return (
        <div className="glass neon-outline card-radius p-4">
            <div className="flex items-start gap-3">
                <div className="grid place-items-center h-10 w-10 rounded-2xl bg-[rgba(199,255,91,0.12)] border border-[rgba(199,255,91,0.18)]">
                    <Lightbulb className="w-5 h-5 text-[hsl(var(--primary))]" />
                </div>
                <div className="min-w-0">
                    <p className="font-semibold">Consejo para ti</p>
                    <p className="text-sm mt-1">{tipData.tip}</p>
                    <p className="text-xs text-muted-foreground mt-1">{tipData.motivation}</p>
                </div>
            </div>
        </div>
    );
}

function SideMenu({
    onNavigate,
    onReset,
    profileName,
    profileAvatar,
}: {
    onNavigate: (screen: "main" | "stats" | "profile" | "real_savings" | "goals") => void;
    onReset: () => void;
    profileName: string;
    profileAvatar: string;
}) {
    const [isOpen, setIsOpen] = useState(false);

    const handleNavigation = (screen: "main" | "stats" | "profile" | "real_savings" | "goals") => {
        onNavigate(screen);
        setIsOpen(false);
    };

    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="pill bg-white/5 hover:bg-white/10 border border-white/10">
                    <Menu className="w-5 h-5" />
                </Button>
            </SheetTrigger>

            <SheetContent side="right" className="w-full max-w-sm p-0 flex flex-col bg-transparent border-0">
                <div className="h-full glass">
                    <SheetHeader className="p-5 border-b border-white/10">
                        <SheetTitle className="sr-only">Menú Principal</SheetTitle>
                        <div className="flex items-center gap-4">
                            <Avatar className="w-12 h-12 border border-white/15">
                                <AvatarImage src={profileAvatar} alt="User Avatar" />
                                <AvatarFallback>{profileName?.[0]?.toUpperCase() ?? "U"}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="text-lg font-semibold">Hola {profileName}</p>
                                <p className="text-sm text-muted-foreground">Tu panel</p>
                            </div>
                        </div>
                    </SheetHeader>

                    <div className="flex-grow p-4 space-y-2">
                        <Button variant="ghost" className="w-full justify-start text-base pill bg-white/0 hover:bg-white/5" onClick={() => handleNavigation("profile")}>
                            <User className="mr-2 w-5 h-5" /> Perfil
                        </Button>
                        <Button variant="ghost" className="w-full justify-start text-base pill bg-white/0 hover:bg-white/5" onClick={() => handleNavigation("stats")}>
                            <BarChart2 className="mr-2 w-5 h-5" /> Estadísticas
                        </Button>
                        <Button variant="ghost" className="w-full justify-start text-base pill bg-white/0 hover:bg-white/5" onClick={() => handleNavigation("real_savings")}>
                            <Wallet className="mr-2 w-5 h-5" /> Ahorro Real
                        </Button>
                        <Button variant="ghost" className="w-full justify-start text-base pill bg-white/0 hover:bg-white/5" onClick={() => handleNavigation("goals")}>
                            <Target className="mr-2 w-5 h-5" /> Mis Metas
                        </Button>

                        <Separator className="my-4 bg-white/10" />

                        <Dialog>
                            <DialogTrigger asChild>
                                <Button variant="ghost" className="w-full justify-start text-base pill bg-white/0 hover:bg-white/5">
                                    <HelpCircle className="mr-2 w-5 h-5" /> Ayuda
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="glass border-white/10">
                                <DialogHeader>
                                    <DialogTitle>Instrucciones</DialogTitle>
                                </DialogHeader>
                                <div className="text-sm text-muted-foreground space-y-2">
                                    <p><strong>Reto 365:</strong> Cada día, saca una tarjeta con un monto aleatorio para ahorrar.</p>
                                    <p><strong>Ahorrar:</strong> Guarda el monto mostrado.</p>
                                    <p><strong>Posponer:</strong> Si no puedes ahorrarlo hoy, el monto queda pendiente.</p>
                                    <p><strong>Ahorro Real:</strong> Completa montos pospuestos cuando quieras.</p>
                                    <p><strong>Metas:</strong> Define objetivos y sigue tu progreso.</p>
                                    <p><strong>Estadísticas:</strong> Visualiza tu avance con gráficos.</p>
                                    <p><strong>Consejos AI:</strong> Tips personalizados para tu hábito.</p>
                                </div>
                            </DialogContent>
                        </Dialog>

                        <Separator className="my-4 bg-white/10" />

                        <Button
                            variant="outline"
                            className="w-full justify-start text-base pill border-white/15 bg-white/5 hover:bg-white/10"
                            onClick={() => {
                                signOut(auth);
                                setIsOpen(false);
                            }}
                        >
                            Cerrar sesión
                        </Button>
                    </div>

                    <div className="p-4 border-t border-white/10">
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" className="w-full pill">
                                    Reiniciar Progreso
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="glass border-white/10">
                                <AlertDialogHeader>
                                    <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                                    <AlertDialogDescription>Esta acción no se puede deshacer. Todo tu progreso será eliminado.</AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel className="pill">Cancelar</AlertDialogCancel>
                                    <AlertDialogAction
                                        className="pill"
                                        onClick={() => {
                                            onReset();
                                            setIsOpen(false);
                                        }}
                                    >
                                        Reiniciar
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}

export default function HomeClient() {
    const { user, logout } = useAuth();

    const [isLoading, setIsLoading] = useState(true);
    const [screen, setScreen] = useState<"main" | "stats" | "profile" | "real_savings" | "goals">("main");

    const [profileName, setProfileName] = useState("Usuario001");
    const [profileAvatar, setProfileAvatar] = useState<string>("https://placehold.co/100x100.png");
    const [goToProfileEdit, setGoToProfileEdit] = useState(false);

    const [savingsHistory, setSavingsHistory] = useState<SavingsRecord[]>([]);
    const [goals, setGoals] = useState<Goal[]>([]);
    const [remainingCards, setRemainingCards] = useState<number[]>([]);
    const [currentDrawnNumber, setCurrentDrawnNumber] = useState<number | null>(null);
    const [tipTrigger, setTipTrigger] = useState(0);

    // Splash + load local
    useEffect(() => {
        const t = setTimeout(() => setIsLoading(false), 900);

        try {
            const storedHistory = localStorage.getItem("savingsHistory");
            const history: SavingsRecord[] = storedHistory ? JSON.parse(storedHistory) : [];
            setSavingsHistory(history);

            const storedGoals = localStorage.getItem("goals");
            setGoals(storedGoals ? JSON.parse(storedGoals) : []);

            const allCards = Array.from({ length: TOTAL_DAYS }, (_, i) => i + 1);
            const usedCards = new Set(history.map((item) => item.value));
            setRemainingCards(allCards.filter((card) => !usedCards.has(card)));

            const storedProfile = localStorage.getItem("profile");
            if (storedProfile) {
                const p = JSON.parse(storedProfile);
                if (p?.name) setProfileName(p.name);
                if (p?.avatar) setProfileAvatar(p.avatar);
            }
        } catch {
            setRemainingCards(Array.from({ length: TOTAL_DAYS }, (_, i) => i + 1));
        }

        return () => clearTimeout(t);
    }, []);

    // Sync profile from auth (si existe)
    useEffect(() => {
        if (!user) return;
        setProfileName(user.displayName || user.email || "Usuario");
        setProfileAvatar(user.photoURL || "https://placehold.co/100x100.png");
    }, [user]);

    // Persist
    useEffect(() => {
        try {
            localStorage.setItem("savingsHistory", JSON.stringify(savingsHistory));
            localStorage.setItem("goals", JSON.stringify(goals));
            localStorage.setItem("profile", JSON.stringify({ name: profileName, avatar: profileAvatar }));
        } catch { }
    }, [savingsHistory, goals, profileName, profileAvatar]);

    const { savedRecords, totalSavings, totalPostponed, progressPercent, drawnCount, remainingDays } = useMemo(() => {
        const saved = savingsHistory.filter((item) => item.saved);
        const postponed = savingsHistory.filter((item) => !item.saved);

        const totalSavedAmount = saved.reduce((sum, item) => sum + item.value, 0);
        const totalPostponedAmount = postponed.reduce((sum, item) => sum + item.value, 0);

        const count = savingsHistory.length;
        const percent = (count / TOTAL_DAYS) * 100;
        const remaining = TOTAL_DAYS - count;

        return {
            savedRecords: saved,
            totalSavings: totalSavedAmount,
            totalPostponed: totalPostponedAmount,
            progressPercent: percent,
            drawnCount: count,
            remainingDays: remaining,
        };
    }, [savingsHistory]);

    const totalGoalsAmount = useMemo(() => goals.reduce((sum, goal) => sum + goal.amount, 0), [goals]);
    const goalsProgress = useMemo(() => (totalGoalsAmount > 0 ? (totalSavings / totalGoalsAmount) * 100 : 0), [totalSavings, totalGoalsAmount]);

    const monthlyData = useMemo(() => {
        const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
        const monthlyTotals: Record<number, number> = {};

        savedRecords.forEach((item) => {
            const month = new Date(item.date).getMonth();
            monthlyTotals[month] = (monthlyTotals[month] || 0) + item.value;
        });

        return monthNames
            .map((name, index) => ({ month: name, total: monthlyTotals[index] || 0 }))
            .filter((m) => m.total > 0);
    }, [savedRecords]);

    const handleDrawCard = useCallback(() => {
        if (currentDrawnNumber !== null) return;
        if (remainingCards.length === 0) return;
        const randomIndex = Math.floor(Math.random() * remainingCards.length);
        setCurrentDrawnNumber(remainingCards[randomIndex]);
    }, [remainingCards, currentDrawnNumber]);

    const handleCardAction = useCallback(
        (saved: boolean) => {
            if (currentDrawnNumber === null) return;

            const newEntry: SavingsRecord = {
                value: currentDrawnNumber,
                saved,
                date: new Date().toISOString().split("T")[0],
                day: savingsHistory.length + 1,
            };

            setSavingsHistory((prev) => [...prev, newEntry]);
            setRemainingCards((prev) => prev.filter((n) => n !== currentDrawnNumber));
            setCurrentDrawnNumber(null);
            setTipTrigger((c) => c + 1);
        },
        [currentDrawnNumber, savingsHistory.length]
    );

    const handleReset = useCallback(() => {
        setSavingsHistory([]);
        setGoals([]);
        setRemainingCards(Array.from({ length: TOTAL_DAYS }, (_, i) => i + 1));
        setCurrentDrawnNumber(null);
    }, []);

    const handleSavePostponed = useCallback((day: number) => {
        setSavingsHistory((prev) =>
            prev.map((item) => (item.day === day ? { ...item, saved: true, date: new Date().toISOString().split("T")[0] } : item))
        );
    }, []);

    const handleAddGoal = useCallback((name: string, amount: number, color: string) => {
        const newGoal: Goal = { id: Date.now(), name, amount, color };
        setGoals((prev) => [...prev, newGoal]);
    }, []);

    const handleDeleteGoal = useCallback((id: number) => {
        setGoals((prev) => prev.filter((g) => g.id !== id));
    }, []);

    const handleAvatarFile = async (file: File) => {
        const reader = new FileReader();
        reader.onload = () => setProfileAvatar(reader.result as string);
        reader.readAsDataURL(file);
    };

    const currentDate = useMemo(() => new Date().toLocaleDateString("es-ES", { day: "numeric", month: "long" }), []);

    if (isLoading) return <SplashScreen />;

    const chartConfig: ChartConfig = {
        value: { label: "Ahorro", color: "hsl(var(--chart-1))" },
        total: { label: "Ahorro", color: "hsl(var(--chart-1))" },
    };

    const renderHeader = (title: string) => (
        <header className="flex items-center justify-between gap-3">
            {screen !== "main" ? (
                <Button variant="ghost" size="icon" className="pill bg-white/5 hover:bg-white/10 border border-white/10" onClick={() => setScreen("main")}>
                    <ChevronLeft className="w-5 h-5" />
                </Button>
            ) : (
                <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10 border border-white/15">
                        <AvatarImage src={profileAvatar} alt="User Avatar" />
                        <AvatarFallback>{profileName?.[0]?.toUpperCase() ?? "U"}</AvatarFallback>
                    </Avatar>

                    <div>
                        <p className="text-xs text-muted-foreground">Account</p>
                        <div className="flex items-center gap-2">
                            <p className="font-semibold leading-tight">{profileName}</p>

                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 pill bg-white/0 hover:bg-white/5 border border-white/10"
                                onClick={() => {
                                    setGoToProfileEdit(true);
                                    setScreen("profile");
                                }}
                                aria-label="Editar perfil"
                            >
                                <Pencil className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex-1 text-center">
                <p className="text-sm text-muted-foreground">{screen === "main" ? currentDate : " "}</p>
                {screen !== "main" && <h1 className="text-base font-semibold">{title}</h1>}
            </div>

            <SideMenu onNavigate={setScreen} onReset={handleReset} profileName={profileName} profileAvatar={profileAvatar} />
        </header>
    );

    const BottomNav = () => (
        <div className="fixed bottom-0 left-0 right-0 z-40">
            <div className="mx-auto max-w-md px-4 pb-4">
                <div className="glass neon-outline card-radius px-3 py-2 flex items-center justify-between">
                    <button
                        className={`flex flex-col items-center justify-center px-3 py-2 pill w-full ${screen === "main" ? "text-[hsl(var(--primary))]" : "text-muted-foreground"
                            }`}
                        onClick={() => setScreen("main")}
                    >
                        <Wallet className="w-5 h-5" />
                        <span className="text-[11px] mt-1">Wallet</span>
                    </button>

                    <button
                        className={`flex flex-col items-center justify-center px-3 py-2 pill w-full ${screen === "stats" ? "text-[hsl(var(--primary))]" : "text-muted-foreground"
                            }`}
                        onClick={() => setScreen("stats")}
                    >
                        <BarChart2 className="w-5 h-5" />
                        <span className="text-[11px] mt-1">Stats</span>
                    </button>

                    <button
                        className={`flex flex-col items-center justify-center px-3 py-2 pill w-full ${screen === "goals" ? "text-[hsl(var(--primary))]" : "text-muted-foreground"
                            }`}
                        onClick={() => setScreen("goals")}
                    >
                        <Target className="w-5 h-5" />
                        <span className="text-[11px] mt-1">Metas</span>
                    </button>

                    <button
                        className={`flex flex-col items-center justify-center px-3 py-2 pill w-full ${screen === "profile" ? "text-[hsl(var(--primary))]" : "text-muted-foreground"
                            }`}
                        onClick={() => setScreen("profile")}
                    >
                        <User className="w-5 h-5" />
                        <span className="text-[11px] mt-1">Perfil</span>
                    </button>
                </div>
            </div>
        </div>
    );

    const MainScreen = (
        <div className="mx-auto max-w-md px-4 pt-6 pb-28 space-y-5">
            {renderHeader("Bienvenido")}

            <div className="glass card-radius p-4">
                <div className="flex justify-between mb-2 text-xs text-muted-foreground">
                    <span>Progreso</span>
                    <span className="font-semibold text-foreground">
                        {drawnCount}/{TOTAL_DAYS}
                    </span>
                </div>
                <Progress value={progressPercent} className="h-2 [&>div]:bg-[hsl(var(--primary))]" />
                <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                    <span>Quedan {remainingDays} días</span>
                    <span>{progressPercent.toFixed(1)}%</span>
                </div>
            </div>

            <div className="relative overflow-hidden glass neon-outline card-radius p-5">
                <div className="absolute -top-16 -right-16 h-44 w-44 rounded-full bg-[rgba(199,255,91,0.18)] blur-2xl" />
                <div className="absolute -bottom-20 -left-16 h-44 w-44 rounded-full bg-[rgba(162,227,147,0.14)] blur-2xl" />

                <div className="relative">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-muted-foreground">Main Wallet (MXN)</p>
                            <p className="text-sm text-muted-foreground">Ahorro real</p>
                        </div>
                        <div className="h-9 w-14 rounded-xl border border-white/15 bg-white/5" />
                    </div>

                    <p className="mt-3 text-4xl font-black tracking-tight tabular-nums">${totalSavings.toLocaleString()}</p>

                    <div className="mt-4 grid grid-cols-2 gap-3">
                        <Button
                            className="pill font-semibold text-[hsl(var(--primary-foreground))] bg-[hsl(var(--primary))] hover:opacity-90 disabled:opacity-40"
                            onClick={handleDrawCard}
                            disabled={remainingCards.length === 0 || currentDrawnNumber !== null}
                        >
                            {currentDrawnNumber !== null ? "Decide primero" : remainingCards.length > 0 ? "Sacar tarjeta" : "Completado"}
                        </Button>

                        <Button variant="outline" className="pill border-white/15 bg-white/5 hover:bg-white/10" onClick={() => setScreen("real_savings")}>
                            Pendientes: ${totalPostponed.toLocaleString()}
                        </Button>
                    </div>
                </div>
            </div>

            <PersonalizedTip history={savingsHistory} trigger={tipTrigger} />

            {currentDrawnNumber !== null && (
                <div className="glass neon-outline card-radius p-5">
                    <p className="text-xs text-muted-foreground">Tarjeta del día</p>
                    <p className="mt-2 text-6xl font-black text-[hsl(var(--primary))] tabular-nums">${currentDrawnNumber}</p>

                    <div className="mt-5 grid grid-cols-2 gap-3">
                        <Button className="pill font-semibold" onClick={() => handleCardAction(true)}>
                            Ahorrar
                        </Button>
                        <Button variant="secondary" className="pill font-semibold bg-white/5 hover:bg-white/10 border border-white/10" onClick={() => handleCardAction(false)}>
                            Posponer
                        </Button>
                    </div>

                    <p className="mt-3 text-xs text-muted-foreground">Tip: si la pospones, podrás completarla en “Ahorro Real”.</p>
                </div>
            )}

            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold">Transactions</p>
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="ghost" className="pill text-xs bg-white/0 hover:bg-white/5">
                                <History className="w-4 h-4 mr-2" />
                                Ver historial
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="glass border-white/10">
                            <DialogHeader>
                                <DialogTitle>Historial de Ahorros</DialogTitle>
                            </DialogHeader>
                            <div className="max-h-[60vh] overflow-y-auto pr-2">
                                <SavingsHistoryList history={[...savingsHistory].reverse()} onSavePostponed={handleSavePostponed} />
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="glass card-radius p-4">
                    {savingsHistory.length === 0 ? (
                        <p className="text-sm text-muted-foreground">Aún no hay movimientos. Saca tu primera tarjeta.</p>
                    ) : (
                        <div className="space-y-3">
                            {[...savingsHistory].slice(-3).reverse().map((item) => (
                                <div key={item.day} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className={`h-9 w-9 rounded-2xl grid place-items-center border
                      ${item.saved
                                                    ? "bg-[rgba(162,227,147,0.12)] border-[rgba(162,227,147,0.18)] text-[rgb(162,227,147)]"
                                                    : "bg-[rgba(255,80,80,0.10)] border-[rgba(255,80,80,0.16)] text-[rgb(255,120,120)]"
                                                }`}
                                        >
                                            {item.saved ? <ArrowDownRight className="w-4 h-4" /> : <ArrowUpLeft className="w-4 h-4" />}
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold">{item.saved ? "Ahorro" : "Pospuesto"}</p>
                                            <p className="text-xs text-muted-foreground">Día {item.day}</p>
                                        </div>
                                    </div>
                                    <p className="font-black tabular-nums">${item.value}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {goals.length > 0 && (
                    <div className="glass card-radius p-4">
                        <div className="flex justify-between mb-2 text-xs text-muted-foreground">
                            <span>Metas</span>
                            <span className="font-semibold text-foreground">{goalsProgress.toFixed(0)}%</span>
                        </div>
                        <Progress value={goalsProgress} className="h-2 [&>div]:bg-[hsl(var(--primary))]" />
                    </div>
                )}
            </div>
        </div>
    );

    const StatsScreen = (
        <div className="mx-auto max-w-md px-4 pt-6 pb-28 space-y-5">
            {renderHeader("Statistic")}

            <div className="glass neon-outline card-radius p-5">
                <p className="text-xs text-muted-foreground">Current Balance</p>
                <p className="mt-2 text-4xl font-black tabular-nums">${totalSavings.toLocaleString()}</p>

                <div className="mt-4">
                    <Tabs defaultValue="monthly" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 bg-white/5 border border-white/10 pill">
                            <TabsTrigger value="daily" className="pill">
                                Diario
                            </TabsTrigger>
                            <TabsTrigger value="monthly" className="pill">
                                Mensual
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="daily" className="mt-4">
                            <div className="glass card-radius p-4">
                                <p className="text-sm font-semibold mb-2">Ahorro Diario</p>
                                <ChartContainer config={chartConfig} className="h-[250px] w-full">
                                    <BarChart data={savedRecords.slice(-7)}>
                                        <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="hsl(var(--border)/0.25)" />
                                        <XAxis dataKey="day" tickLine={false} axisLine={false} tickFormatter={(v) => `D${v}`} />
                                        <YAxis tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
                                        <Tooltip cursor={{ fill: "rgba(255,255,255,0.03)" }} content={<ChartTooltipContent />} />
                                        <Bar dataKey="value" fill="hsl(var(--primary))" radius={8} />
                                    </BarChart>
                                </ChartContainer>
                            </div>
                        </TabsContent>

                        <TabsContent value="monthly" className="mt-4">
                            <div className="glass card-radius p-4">
                                <p className="text-sm font-semibold mb-2">Ahorro Mensual</p>
                                <ChartContainer config={chartConfig} className="h-[250px] w-full">
                                    <LineChart data={monthlyData}>
                                        <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="hsl(var(--border)/0.25)" />
                                        <XAxis dataKey="month" tickLine={false} axisLine={false} />
                                        <YAxis tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
                                        <Tooltip cursor={{ stroke: "hsl(var(--primary))", strokeWidth: 2 }} content={<ChartTooltipContent />} />
                                        <Line type="monotone" dataKey="total" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: "hsl(var(--primary))" }} />
                                    </LineChart>
                                </ChartContainer>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>

            <div className="glass card-radius p-4">
                <p className="text-sm font-semibold mb-2">Resumen</p>
                <div className="grid grid-cols-2 gap-3">
                    <div className="glass card-radius p-3">
                        <p className="text-xs text-muted-foreground">Ahorros</p>
                        <p className="text-xl font-black text-[rgb(162,227,147)] tabular-nums">${totalSavings.toLocaleString()}</p>
                    </div>
                    <div className="glass card-radius p-3">
                        <p className="text-xs text-muted-foreground">Pendiente</p>
                        <p className="text-xl font-black text-[rgb(255,120,120)] tabular-nums">${totalPostponed.toLocaleString()}</p>
                    </div>
                </div>
            </div>
        </div>
    );

    const ProfileScreen = (

        <div className="mx-auto max-w-md px-4 pt-6 pb-28 space-y-5">
            {renderHeader("Mi Perfil")}

            <div className="glass neon-outline card-radius p-5 text-center">
                <Avatar className="w-20 h-20 border border-white/15 mx-auto">
                    <AvatarImage src={profileAvatar} alt="User Avatar" />
                    <AvatarFallback>{profileName?.[0]?.toUpperCase() ?? "U"}</AvatarFallback>
                </Avatar>
                <h2 className="mt-3 text-2xl font-black">{profileName}</h2>
                <p className="text-xs text-muted-foreground">ID: 8676113636</p>
            </div>

            <div className="glass neon-outline card-radius p-5">
                <p className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <Camera className="w-4 h-4" /> Editar perfil
                </p>

                <div className="space-y-4">
                    <div>
                        <Label htmlFor="profile-name">Nombre de usuario</Label>
                        <Input
                            id="profile-name"
                            value={profileName}
                            onChange={(e) => setProfileName(e.target.value)}
                            placeholder="Ej: Karlos"
                            className="mt-2"
                            autoFocus={goToProfileEdit}
                        />
                    </div>

                    <div>
                        <Label htmlFor="profile-avatar-url">Avatar por URL</Label>
                        <Input
                            id="profile-avatar-url"
                            value={profileAvatar.startsWith("data:") ? "" : profileAvatar}
                            onChange={(e) => setProfileAvatar(e.target.value)}
                            placeholder="https://..."
                            className="mt-2"
                        />
                        <p className="text-xs text-muted-foreground mt-2">Si subes imagen, se guardará local (base64) y este campo quedará vacío.</p>
                    </div>

                    <div>
                        <Label htmlFor="profile-avatar-file">O subir imagen</Label>
                        <Input
                            id="profile-avatar-file"
                            type="file"
                            accept="image/*"
                            className="mt-2"
                            onChange={(e) => {
                                const f = e.target.files?.[0];
                                if (f) handleAvatarFile(f);
                            }}
                        />
                    </div>

                    <Button
                        variant="destructive"
                        className="w-full pill"
                        onClick={async () => {
                            await logout();
                            // opcional: si quieres también limpiar datos locales
                            // localStorage.removeItem("profile");
                            // localStorage.removeItem("savingsHistory");
                            // localStorage.removeItem("goals");
                        }}
                    >
                        Salir / Cambiar cuenta
                    </Button>


                    <Button
                        className="w-full pill"
                        onClick={() => {
                            setGoToProfileEdit(false);
                            setScreen("main");
                        }}
                    >
                        Guardar cambios
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div className="glass card-radius p-4 text-center">
                    <p className="text-xs text-muted-foreground">Ahorro Real</p>
                    <p className="text-xl font-black text-[rgb(162,227,147)] tabular-nums">${totalSavings.toLocaleString()}</p>
                </div>
                <div className="glass card-radius p-4 text-center">
                    <p className="text-xs text-muted-foreground">Pendiente</p>
                    <p className="text-xl font-black text-[rgb(255,120,120)] tabular-nums">${totalPostponed.toLocaleString()}</p>
                </div>
            </div>

            <div className="glass card-radius p-5">
                <p className="text-sm font-semibold mb-3">Logros</p>
                <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="glass card-radius p-3">
                        <Trophy className="w-6 h-6 mx-auto text-[hsl(var(--primary))]" />
                        <p className="text-[11px] mt-2 font-semibold">Primeros</p>
                    </div>
                    <div className="glass card-radius p-3">
                        <Percent className="w-6 h-6 mx-auto text-[hsl(var(--primary))]" />
                        <p className="text-[11px] mt-2 font-semibold">Constante</p>
                    </div>
                    <div className="glass card-radius p-3">
                        <Tags className="w-6 h-6 mx-auto text-[hsl(var(--primary))]" />
                        <p className="text-[11px] mt-2 font-semibold">Meta</p>
                    </div>
                </div>
            </div>
        </div>
    );

    const RealSavingsScreen = () => {
        const postponed = [...savingsHistory].filter((item) => !item.saved).reverse();
        return (
            <div className="mx-auto max-w-md px-4 pt-6 pb-28 space-y-5">
                {renderHeader("Ahorro Real")}

                <div className="grid grid-cols-2 gap-3">
                    <div className="glass card-radius p-4 text-center">
                        <p className="text-xs text-muted-foreground">Ahorro Real</p>
                        <p className="text-xl font-black text-[rgb(162,227,147)] tabular-nums">${totalSavings.toLocaleString()}</p>
                    </div>
                    <div className="glass card-radius p-4 text-center">
                        <p className="text-xs text-muted-foreground">Pendiente</p>
                        <p className="text-xl font-black text-[rgb(255,120,120)] tabular-nums">${totalPostponed.toLocaleString()}</p>
                    </div>
                </div>

                <div className="glass card-radius p-5">
                    <p className="text-sm font-semibold">Tarjetas por Completar</p>
                    <p className="text-xs text-muted-foreground mt-1">Completa los montos que pospusiste.</p>

                    <div className="mt-4 max-h-[50vh] overflow-y-auto pr-1">
                        {postponed.length > 0 ? (
                            <SavingsHistoryList history={postponed} onSavePostponed={handleSavePostponed} />
                        ) : (
                            <p className="text-center text-muted-foreground py-8">¡No tienes pendientes! 🔥</p>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    const GoalsScreen = () => {
        const [name, setName] = useState("");
        const [amount, setAmount] = useState("");
        const [selectedColor, setSelectedColor] = useState(goalColors[0]);

        const handleFormSubmit = (e: React.FormEvent) => {
            e.preventDefault();
            const numAmount = parseFloat(amount);
            if (name && numAmount > 0) {
                handleAddGoal(name, numAmount, selectedColor);
                setName("");
                setAmount("");
                setSelectedColor(goalColors[0]);
            }
        };

        return (
            <div className="mx-auto max-w-md px-4 pt-6 pb-28 space-y-5">
                {renderHeader("Mis Metas")}

                <Dialog>
                    <DialogTrigger asChild>
                        <Button className="w-full pill bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:opacity-90">
                            <Plus className="mr-2 w-4 h-4" /> Añadir Nueva Meta
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="glass border-white/10">
                        <DialogHeader>
                            <DialogTitle>Nueva Meta de Ahorro</DialogTitle>
                        </DialogHeader>

                        <form onSubmit={handleFormSubmit} className="space-y-4">
                            <div>
                                <Label htmlFor="goal-name">Nombre</Label>
                                <Input id="goal-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej: Carro nuevo" required />
                            </div>
                            <div>
                                <Label htmlFor="goal-amount">Monto</Label>
                                <Input id="goal-amount" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Ej: 5000" required />
                            </div>
                            <div>
                                <Label>Color</Label>
                                <div className="flex gap-2 mt-2">
                                    {goalColors.map((color) => (
                                        <button
                                            type="button"
                                            key={color}
                                            onClick={() => setSelectedColor(color)}
                                            className={`w-9 h-9 rounded-full transition-all border border-white/15 ${selectedColor === color ? "ring-2 ring-[hsl(var(--primary))] ring-offset-2 ring-offset-black" : ""
                                                }`}
                                            style={{ backgroundColor: color }}
                                        />
                                    ))}
                                </div>
                            </div>

                            <Button type="submit" className="w-full pill">
                                Guardar
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>

                <div className="space-y-3">
                    {goals.length === 0 && (
                        <div className="glass card-radius p-8 text-center">
                            <Target className="mx-auto w-10 h-10 text-muted-foreground mb-3" />
                            <h3 className="text-lg font-semibold">Sin metas</h3>
                            <p className="text-sm text-muted-foreground">Crea tu primera meta para medir tu progreso.</p>
                        </div>
                    )}

                    {goals.map((goal) => {
                        const progress = Math.min((totalSavings / goal.amount) * 100, 100);
                        return (
                            <div key={goal.id} className="glass card-radius p-5" style={{ ["--goal-color" as any]: goal.color }}>
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <p className="text-sm text-muted-foreground">Meta</p>
                                        <p className="text-xl font-black truncate" style={{ color: "var(--goal-color)" as any }}>
                                            {goal.name}
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-1">Objetivo: ${goal.amount.toLocaleString()}</p>
                                    </div>

                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="ghost" size="sm" className="pill text-muted-foreground hover:text-destructive hover:bg-white/5">
                                                Eliminar
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent className="glass border-white/10">
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>¿Eliminar meta?</AlertDialogTitle>
                                                <AlertDialogDescription>Se eliminará la meta "{goal.name}".</AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel className="pill">Cancelar</AlertDialogCancel>
                                                <AlertDialogAction className="pill" onClick={() => handleDeleteGoal(goal.id)}>
                                                    Eliminar
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>

                                <div className="mt-4">
                                    <div className="flex justify-between mb-2 text-xs text-muted-foreground">
                                        <span>Progreso</span>
                                        <span className="font-semibold" style={{ color: "var(--goal-color)" as any }}>
                                            {progress.toFixed(0)}%
                                        </span>
                                    </div>
                                    <Progress value={progress} className="h-2 [&>div]:bg-[var(--goal-color)]" />
                                    <p className="text-xs text-muted-foreground mt-2">
                                        Has ahorrado ${totalSavings.toLocaleString()} de ${goal.amount.toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-dvh">
            {screen === "main" && MainScreen}
            {screen === "stats" && StatsScreen}
            {screen === "profile" && ProfileScreen}
            {screen === "real_savings" && <RealSavingsScreen />}
            {screen === "goals" && <GoalsScreen />}
            <BottomNav />
        </div>
    );
}
