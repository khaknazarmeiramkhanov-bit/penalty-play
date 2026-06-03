import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Bot, Brain, MessageSquare, Settings, Sparkles, Zap } from "lucide-react";

import { Button } from "@/components/ui/button";
import { createThread, notifyThreadsChanged } from "@/lib/threads";

export const Route = createFileRoute("/ai/")({
  component: WelcomePage,
});

const features = [
  {
    icon: Brain,
    title: "Глубокое мышление",
    desc: "Многошаговое рассуждение и анализ сложных задач в реальном времени.",
  },
  {
    icon: Zap,
    title: "Мгновенный отклик",
    desc: "Стриминговые ответы с поддержкой markdown, кода и формул.",
  },
  {
    icon: MessageSquare,
    title: "История чатов",
    desc: "Все диалоги сохраняются локально и доступны из бокового меню.",
  },
  {
    icon: Sparkles,
    title: "Креатив и идеи",
    desc: "Помощник для текстов, кода, планов и любых нестандартных задач.",
  },
];

function WelcomePage() {
  const navigate = useNavigate();
  const startChat = () => {
    const t = createThread();
    notifyThreadsChanged();
    navigate({ to: "/ai/chat/$threadId", params: { threadId: t.id } });
  };

  return (
    <div className="relative mx-auto flex w-full max-w-6xl flex-col items-center px-6 pt-16 pb-24">
      <div className="cohere-chip mb-6">
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
        </span>
        powered by neural gateway
      </div>

      <h1 className="text-center text-5xl font-bold tracking-tight text-white sm:text-6xl md:text-7xl">
        Привет, я{" "}
        <span className="bg-gradient-to-r from-emerald-300 via-emerald-400 to-teal-300 bg-clip-text text-transparent drop-shadow-[0_0_24px_rgba(16,185,129,0.4)]">
          Cohere AI
        </span>
      </h1>
      <p className="mt-5 max-w-2xl text-center text-base text-white/65 sm:text-lg">
        Твой персональный ассистент с футуристичным интерфейсом. Спроси что угодно — от
        кода до идей, от перевода до объяснений.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Button
          onClick={startChat}
          size="lg"
          className="group bg-gradient-to-r from-emerald-500 to-emerald-400 text-black shadow-[0_0_30px_rgba(16,185,129,0.5)] transition-all hover:shadow-[0_0_44px_rgba(16,185,129,0.75)]"
        >
          <Bot className="h-4 w-4" />
          Начать диалог
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Button>
        <Button asChild size="lg" variant="outline" className="cohere-ghost">
          <Link to="/ai/settings">
            <Settings className="h-4 w-4" />
            Настройки
          </Link>
        </Button>
      </div>

      <div className="mt-20 grid w-full grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((f) => (
          <div key={f.title} className="cohere-card group">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-400/30 transition group-hover:bg-emerald-500/25 group-hover:shadow-[0_0_18px_rgba(16,185,129,0.45)]">
              <f.icon className="h-5 w-5" />
            </div>
            <h3 className="text-base font-semibold text-white">{f.title}</h3>
            <p className="mt-1.5 text-sm text-white/55">{f.desc}</p>
          </div>
        ))}
      </div>

      <div className="mt-16 grid w-full gap-4 sm:grid-cols-3">
        {[
          "Объясни квантовую запутанность простыми словами",
          "Напиши план запуска SaaS-продукта",
          "Сгенерируй React-компонент c анимацией",
        ].map((q) => (
          <button
            key={q}
            type="button"
            onClick={startChat}
            className="cohere-card text-left transition hover:border-emerald-400/40 hover:bg-emerald-500/5"
          >
            <span className="text-[11px] tracking-[0.2em] text-emerald-400/70 uppercase">
              prompt
            </span>
            <p className="mt-2 text-sm text-white/80">{q}</p>
          </button>
        ))}
      </div>
    </div>
  );
}