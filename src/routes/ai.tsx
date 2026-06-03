import { Link, Outlet, createFileRoute } from "@tanstack/react-router";

import { AppSidebar } from "@/components/ai/AppSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

export const Route = createFileRoute("/ai")({
  head: () => ({
    meta: [
      { title: "Cohere AI — Neural Assistant" },
      {
        name: "description",
        content:
          "Современный AI-интерфейс с историей чатов, статистикой и настройками. Тёмная тема, стеклянные панели, зелёные акценты.",
      },
      { property: "og:title", content: "Cohere AI — Neural Assistant" },
      {
        property: "og:description",
        content: "Futuristic AI chat with glassmorphism, dark theme and emerald glow.",
      },
    ],
  }),
  component: AiLayout,
});

function AiLayout() {
  return (
    <div className="cohere-app dark min-h-screen text-foreground">
      <SidebarProvider>
        <div className="cohere-shell relative flex min-h-screen w-full">
          <AppSidebar />
          <div className="relative flex min-h-screen flex-1 flex-col">
            <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-2 border-b border-emerald-400/10 bg-black/40 px-4 backdrop-blur-xl">
              <div className="flex items-center gap-2">
                <SidebarTrigger className="text-emerald-300 hover:bg-emerald-500/10 hover:text-emerald-200" />
                <Link
                  to="/ai"
                  className="text-sm font-semibold tracking-[0.18em] text-white/90 uppercase"
                >
                  Cohere<span className="text-emerald-400">·</span>AI
                </Link>
              </div>
              <div className="flex items-center gap-2">
                <span className="hidden items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-500/5 px-3 py-1 text-[11px] tracking-widest text-emerald-300 uppercase sm:flex">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                  </span>
                  online
                </span>
              </div>
            </header>
            <main className="relative flex-1">
              <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
                <div className="absolute -top-40 -left-40 h-[480px] w-[480px] rounded-full bg-emerald-500/20 blur-[140px]" />
                <div className="absolute top-1/3 -right-32 h-[420px] w-[420px] rounded-full bg-emerald-400/15 blur-[140px]" />
                <div className="absolute bottom-0 left-1/4 h-[360px] w-[360px] rounded-full bg-teal-500/10 blur-[140px]" />
              </div>
              <Outlet />
            </main>
          </div>
        </div>
      </SidebarProvider>
    </div>
  );
}