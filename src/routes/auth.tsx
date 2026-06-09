import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Пенальти — Вход" },
      { name: "description", content: "Регистрация и вход в игру Пенальти." },
    ],
    links: [
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Kanit:ital,wght@0,900;1,900&display=swap",
      },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogle = async () => {
    setError(null);
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin,
        },
      });
      if (error) throw error;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/" });
    });
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: { display_name: displayName.trim() || email.split("@")[0] },
          },
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) throw error;
      }
      navigate({ to: "/" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      className="relative flex min-h-screen w-full flex-col items-center justify-center px-6"
      style={{ backgroundColor: "#0d5c2a", fontFamily: "'Kanit', sans-serif" }}
    >
      <div
        className="w-full max-w-sm rounded-2xl border-2 border-white/10 p-8"
        style={{ backgroundColor: "#0a4a1f" }}
      >
        <h1
          className="mb-2 text-center text-4xl font-black italic tracking-tighter text-white uppercase"
          style={{ textShadow: "0 3px 0 rgba(0,0,0,0.3)" }}
        >
          {mode === "signup" ? "Регистрация" : "Вход"}
        </h1>
        <p className="mb-6 text-center text-sm text-white/60">
          {mode === "signup" ? "Создайте аккаунт" : "Войдите в аккаунт"}
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === "signup" && (
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              maxLength={20}
              placeholder="Никнейм"
              className="w-full rounded-xl border-2 border-white/20 bg-white/10 px-4 py-3 text-center text-lg font-bold text-white placeholder-white/30 outline-none focus:border-[#ccff00]"
            />
          )}
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="Email"
            className="w-full rounded-xl border-2 border-white/20 bg-white/10 px-4 py-3 text-center text-lg font-bold text-white placeholder-white/30 outline-none focus:border-[#ccff00]"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            placeholder="Пароль"
            className="w-full rounded-xl border-2 border-white/20 bg-white/10 px-4 py-3 text-center text-lg font-bold text-white placeholder-white/30 outline-none focus:border-[#ccff00]"
          />

          {error && (
            <p className="rounded-lg bg-red-500/20 px-3 py-2 text-center text-sm text-red-200">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl px-6 py-3 text-lg font-black tracking-widest uppercase transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-40 disabled:hover:scale-100"
            style={{
              backgroundColor: "#000",
              color: "#ccff00",
              border: "2px solid #ccff00",
              boxShadow: "0 0 8px #ccff00, 0 0 16px #ccff00",
              textShadow: "0 0 4px #ccff00",
            }}
          >
            {loading ? "..." : mode === "signup" ? "Создать" : "Войти"}
          </button>
        </form>

        <div className="my-4 flex items-center gap-3">
          <div className="h-px flex-1 bg-white/15" />
          <span className="text-xs font-bold tracking-widest text-white/40 uppercase">или</span>
          <div className="h-px flex-1 bg-white/15" />
        </div>

        <button
          type="button"
          onClick={handleGoogle}
          disabled={loading}
          className="flex w-full items-center justify-center gap-3 rounded-xl border-2 border-white/20 bg-white px-6 py-3 text-base font-black tracking-wide text-gray-800 uppercase transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-40 disabled:hover:scale-100"
        >
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Google
        </button>

        <button
          type="button"
          onClick={() => {
            setMode(mode === "signup" ? "signin" : "signup");
            setError(null);
          }}
          className="mt-4 w-full text-center text-sm font-bold tracking-wide text-white/70 uppercase hover:text-[#ccff00]"
        >
          {mode === "signup" ? "Уже есть аккаунт? Войти" : "Нет аккаунта? Регистрация"}
        </button>

        <Link
          to="/"
          className="mt-2 block text-center text-xs font-bold tracking-widest text-white/40 uppercase hover:text-white/70"
        >
          ← На главную
        </Link>
      </div>
    </main>
  );
}
