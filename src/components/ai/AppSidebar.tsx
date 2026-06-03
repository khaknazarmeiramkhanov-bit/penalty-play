import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  Activity,
  Bot,
  MessageSquarePlus,
  Plus,
  Settings,
  Sparkles,
  Trash2,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  createThread,
  deleteThread,
  notifyThreadsChanged,
  useThreads,
} from "@/lib/threads";

const mainItems = [
  { title: "Главная", url: "/ai", icon: Sparkles, exact: true },
  { title: "Чат", url: "/ai/chat", icon: Bot, exact: false },
  { title: "Статистика", url: "/ai/stats", icon: Activity, exact: true },
  { title: "Настройки", url: "/ai/settings", icon: Settings, exact: true },
];

export function AppSidebar() {
  const navigate = useNavigate();
  const path = useRouterState({ select: (r) => r.location.pathname });
  const { threads, refresh } = useThreads();

  const isActive = (url: string, exact: boolean) =>
    exact ? path === url : path === url || path.startsWith(`${url}/`);

  const onNewThread = () => {
    const t = createThread();
    notifyThreadsChanged();
    navigate({ to: "/ai/chat/$threadId", params: { threadId: t.id } });
  };

  const onDelete = (id: string) => {
    deleteThread(id);
    notifyThreadsChanged();
    refresh();
    if (path.includes(id)) navigate({ to: "/ai/chat" });
  };

  return (
    <Sidebar collapsible="icon" className="cohere-sidebar border-r border-emerald-400/10">
      <SidebarHeader className="border-b border-emerald-400/10 px-3 py-4">
        <div className="flex items-center gap-2">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-[0_0_20px_rgba(16,185,129,0.5)]">
            <Bot className="h-5 w-5 text-black" />
          </div>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-semibold tracking-wide text-white">Cohere AI</span>
            <span className="text-[10px] uppercase tracking-[0.18em] text-emerald-400/70">
              neural assistant
            </span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="cohere-scroll">
        <SidebarGroup>
          <SidebarGroupLabel className="text-emerald-400/60">Навигация</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url, item.exact)}
                    tooltip={item.title}
                    className="data-[active=true]:bg-emerald-500/15 data-[active=true]:text-emerald-300 data-[active=true]:shadow-[inset_0_0_0_1px_rgba(16,185,129,0.35)] hover:bg-emerald-500/10 hover:text-emerald-200"
                  >
                    <Link to={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center justify-between text-emerald-400/60">
            <span>История</span>
            <button
              type="button"
              onClick={onNewThread}
              className="rounded-md p-1 text-emerald-300 transition hover:bg-emerald-500/15"
              aria-label="Новый чат"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {threads.length === 0 && (
                <p className="px-2 py-1.5 text-xs text-white/40 group-data-[collapsible=icon]:hidden">
                  Пока нет чатов
                </p>
              )}
              {threads.map((t) => {
                const active = path === `/ai/chat/${t.id}`;
                return (
                  <SidebarMenuItem key={t.id}>
                    <div className="group/thread relative flex items-center">
                      <SidebarMenuButton
                        asChild
                        isActive={active}
                        tooltip={t.title}
                        className="pr-8 data-[active=true]:bg-emerald-500/15 data-[active=true]:text-emerald-200 hover:bg-emerald-500/10"
                      >
                        <Link
                          to="/ai/chat/$threadId"
                          params={{ threadId: t.id }}
                          className="truncate"
                        >
                          <MessageSquarePlus className="h-4 w-4 shrink-0 opacity-60" />
                          <span className="truncate">{t.title}</span>
                        </Link>
                      </SidebarMenuButton>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          onDelete(t.id);
                        }}
                        className="absolute right-1.5 rounded p-1 text-white/40 opacity-0 transition hover:bg-rose-500/20 hover:text-rose-300 group-hover/thread:opacity-100 group-data-[collapsible=icon]:hidden"
                        aria-label="Удалить чат"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-emerald-400/10 p-3 group-data-[collapsible=icon]:hidden">
        <Button
          onClick={onNewThread}
          className="w-full bg-gradient-to-r from-emerald-500 to-emerald-400 text-black shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:shadow-[0_0_28px_rgba(16,185,129,0.6)]"
        >
          <Plus className="h-4 w-4" /> Новый чат
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}