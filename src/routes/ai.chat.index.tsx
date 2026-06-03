import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

import { createThread, notifyThreadsChanged, useThreads } from "@/lib/threads";

export const Route = createFileRoute("/ai/chat/")({
  component: ChatIndex,
});

function ChatIndex() {
  const navigate = useNavigate();
  const { threads } = useThreads();

  useEffect(() => {
    if (threads.length > 0) {
      navigate({
        to: "/ai/chat/$threadId",
        params: { threadId: threads[0].id },
        replace: true,
      });
      return;
    }
    const t = createThread();
    notifyThreadsChanged();
    navigate({
      to: "/ai/chat/$threadId",
      params: { threadId: t.id },
      replace: true,
    });
    // run once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex h-[calc(100vh-3.5rem)] items-center justify-center text-white/50">
      Загружаем чат…
    </div>
  );
}