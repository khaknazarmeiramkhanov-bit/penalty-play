import { createFileRoute } from "@tanstack/react-router";
import { Bell, Palette, Shield, Trash2, User } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { clearAllThreads, notifyThreadsChanged } from "@/lib/threads";

export const Route = createFileRoute("/ai/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const [name, setName] = useState("Гость");
  const [notifications, setNotifications] = useState(true);
  const [sound, setSound] = useState(false);
  const [glow, setGlow] = useState(true);
  const [confirm, setConfirm] = useState(false);

  const wipe = () => {
    if (!confirm) {
      setConfirm(true);
      window.setTimeout(() => setConfirm(false), 3000);
      return;
    }
    clearAllThreads();
    notifyThreadsChanged();
    setConfirm(false);
  };

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <header className="mb-8">
        <p className="text-[11px] tracking-[0.25em] text-emerald-400/70 uppercase">
          control panel
        </p>
        <h1 className="mt-1 text-3xl font-bold text-white sm:text-4xl">Настройки</h1>
        <p className="mt-2 text-sm text-white/55">
          Персонализируй интерфейс Cohere AI под себя.
        </p>
      </header>

      <div className="space-y-5">
        <SettingsCard icon={User} title="Профиль" desc="Как к тебе обращаться">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="cohere-input"
            placeholder="Имя"
          />
        </SettingsCard>

        <SettingsCard icon={Bell} title="Уведомления" desc="Подсказки и события">
          <Row label="Push-уведомления" hint="Сообщать о готовом ответе.">
            <Switch
              checked={notifications}
              onCheckedChange={setNotifications}
              className="data-[state=checked]:bg-emerald-500"
            />
          </Row>
          <Row label="Звуковой сигнал" hint="Короткий beep после генерации.">
            <Switch
              checked={sound}
              onCheckedChange={setSound}
              className="data-[state=checked]:bg-emerald-500"
            />
          </Row>
        </SettingsCard>

        <SettingsCard icon={Palette} title="Внешний вид" desc="Тема и эффекты">
          <Row label="Зелёное свечение" hint="Неоновые акценты на кнопках и карточках.">
            <Switch
              checked={glow}
              onCheckedChange={setGlow}
              className="data-[state=checked]:bg-emerald-500"
            />
          </Row>
        </SettingsCard>

        <SettingsCard icon={Shield} title="Данные" desc="История хранится в этом браузере">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-white/60">
              Удалить все сохранённые диалоги без возможности восстановления.
            </p>
            <Button
              onClick={wipe}
              variant="outline"
              className={
                confirm
                  ? "border-rose-400/60 bg-rose-500/15 text-rose-200 hover:bg-rose-500/25"
                  : "cohere-ghost text-rose-300 hover:text-rose-200"
              }
            >
              <Trash2 className="h-4 w-4" />
              {confirm ? "Точно удалить?" : "Очистить историю"}
            </Button>
          </div>
        </SettingsCard>
      </div>
    </div>
  );
}

function SettingsCard({
  icon: Icon,
  title,
  desc,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc: string;
  children: React.ReactNode;
}) {
  return (
    <section className="cohere-card">
      <header className="mb-4 flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-400/30">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-white">{title}</h2>
          <p className="text-xs text-white/50">{desc}</p>
        </div>
      </header>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function Row({
  label,
  hint,
  children,
}: {
  label: string;
  hint: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2.5">
      <div className="min-w-0">
        <p className="text-sm text-white">{label}</p>
        <p className="truncate text-xs text-white/45">{hint}</p>
      </div>
      {children}
    </div>
  );
}