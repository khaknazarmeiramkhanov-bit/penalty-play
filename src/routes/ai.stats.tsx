import { createFileRoute } from "@tanstack/react-router";
import { Activity, Clock, MessageSquare, TrendingUp, Zap } from "lucide-react";
import { useMemo } from "react";

import { useThreads } from "@/lib/threads";

export const Route = createFileRoute("/ai/stats")({
  component: StatsPage,
});

function StatsPage() {
  const { threads } = useThreads();

  const stats = useMemo(() => {
    const totalMessages = threads.reduce((acc, t) => acc + t.messages.length, 0);
    const userMessages = threads.reduce(
      (acc, t) => acc + t.messages.filter((m) => m.role === "user").length,
      0,
    );
    const aiMessages = totalMessages - userMessages;
    const lastActive = threads.reduce((acc, t) => Math.max(acc, t.updatedAt), 0);
    return {
      threads: threads.length,
      totalMessages,
      userMessages,
      aiMessages,
      lastActive,
    };
  }, [threads]);

  // Last 7 days activity (by updatedAt)
  const days = useMemo(() => {
    const buckets: { label: string; count: number }[] = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      const next = new Date(d);
      next.setDate(next.getDate() + 1);
      const count = threads.filter(
        (t) => t.updatedAt >= d.getTime() && t.updatedAt < next.getTime(),
      ).length;
      buckets.push({
        label: d.toLocaleDateString(undefined, { weekday: "short" }),
        count,
      });
    }
    return buckets;
  }, [threads]);

  const maxCount = Math.max(1, ...days.map((d) => d.count));

  const cards = [
    {
      icon: MessageSquare,
      label: "Чатов",
      value: stats.threads,
      hint: "сохранено локально",
    },
    {
      icon: Activity,
      label: "Сообщений",
      value: stats.totalMessages,
      hint: `вы: ${stats.userMessages} · AI: ${stats.aiMessages}`,
    },
    {
      icon: Zap,
      label: "AI-ответов",
      value: stats.aiMessages,
      hint: "сгенерировано",
    },
    {
      icon: Clock,
      label: "Активность",
      value: stats.lastActive
        ? new Date(stats.lastActive).toLocaleDateString()
        : "—",
      hint: "последнее обновление",
    },
  ];

  const recent = [...threads]
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .slice(0, 5);

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <header className="mb-8">
        <p className="text-[11px] tracking-[0.25em] text-emerald-400/70 uppercase">
          analytics
        </p>
        <h1 className="mt-1 text-3xl font-bold text-white sm:text-4xl">
          Статистика и активность
        </h1>
        <p className="mt-2 text-sm text-white/55">
          Метрики по твоим диалогам с Cohere AI.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="cohere-card">
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-400/30">
              <c.icon className="h-4 w-4" />
            </div>
            <p className="text-[11px] tracking-[0.18em] text-white/45 uppercase">
              {c.label}
            </p>
            <p className="mt-1 text-3xl font-bold text-white tabular-nums">
              {c.value}
            </p>
            <p className="mt-1 text-xs text-white/40">{c.hint}</p>
          </div>
        ))}
      </div>

      <section className="cohere-card mt-6">
        <header className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-white">Активность за 7 дней</h2>
            <p className="text-xs text-white/45">Обновления чатов по дням</p>
          </div>
          <TrendingUp className="h-5 w-5 text-emerald-300" />
        </header>
        <div className="flex h-40 items-end justify-between gap-2">
          {days.map((d) => (
            <div key={d.label} className="flex flex-1 flex-col items-center gap-2">
              <div
                className="w-full rounded-t-md bg-gradient-to-t from-emerald-500/30 via-emerald-400/60 to-emerald-300 shadow-[0_0_18px_rgba(16,185,129,0.45)] transition-all"
                style={{ height: `${(d.count / maxCount) * 100}%`, minHeight: 4 }}
              />
              <span className="text-[10px] tracking-widest text-white/50 uppercase">
                {d.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="cohere-card mt-6">
        <header className="mb-4">
          <h2 className="text-base font-semibold text-white">Недавние чаты</h2>
          <p className="text-xs text-white/45">Последние 5 диалогов</p>
        </header>
        {recent.length === 0 ? (
          <p className="text-sm text-white/50">Пока нет ни одного чата.</p>
        ) : (
          <ul className="divide-y divide-white/5">
            {recent.map((t) => (
              <li
                key={t.id}
                className="flex items-center justify-between py-3 text-sm"
              >
                <span className="truncate pr-3 text-white/80">{t.title}</span>
                <span className="shrink-0 text-xs text-white/40">
                  {new Date(t.updatedAt).toLocaleString()} · {t.messages.length} сообщ.
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}