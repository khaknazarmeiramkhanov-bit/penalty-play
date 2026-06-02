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
