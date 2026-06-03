import { useChat } from "@ai-sdk/react";
import { createFileRoute } from "@tanstack/react-router";
import { DefaultChatTransport, type UIMessage } from "ai";
import { Bot, Sparkles } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  Message,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
} from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { getThread, notifyThreadsChanged, saveThread } from "@/lib/threads";

export const Route = createFileRoute("/ai/chat/$threadId")({
  component: ChatThreadPage,
});

function ChatThreadPage() {
  const { threadId } = Route.useParams();
  const initialMessages = useMemo<UIMessage[]>(() => {
    const t = getThread(threadId);
    return t?.messages ?? [];
  }, [threadId]);

  return <ChatWindow key={threadId} threadId={threadId} initial={initialMessages} />;
}

function ChatWindow({
  threadId,
  initial,
}: {
  threadId: string;
  initial: UIMessage[];
}) {
  const transport = useMemo(() => new DefaultChatTransport({ api: "/api/chat" }), []);
  const { messages, sendMessage, status, error } = useChat({
    id: threadId,
    messages: initial,
    transport,
  });

  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Focus on mount + status change
  useEffect(() => {
    textareaRef.current?.focus();
  }, [threadId, status]);

  // Persist after each stream completes
  useEffect(() => {
    if (status === "ready" && messages.length > 0) {
      saveThread(threadId, messages);
      notifyThreadsChanged();
    }
  }, [status, messages, threadId]);

  const onSubmit = async (message: { text: string }) => {
    const text = (message.text ?? input).trim();
    if (!text) return;
    setInput("");
    await sendMessage({ text });
  };

  const loading = status === "submitted" || status === "streaming";

  return (
    <div className="relative flex h-[calc(100vh-3.5rem)] flex-col">
      <Conversation className="flex-1">
        <ConversationContent className="mx-auto w-full max-w-3xl px-4 py-6">
          {messages.length === 0 ? (
            <ConversationEmptyState
              icon={
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-[0_0_30px_rgba(16,185,129,0.5)]">
                  <Bot className="h-7 w-7 text-black" />
                </div>
              }
              title="Чем могу помочь?"
              description="Напиши свой запрос — отвечу мгновенно."
              className="text-white"
            />
          ) : (
            messages.map((m) => {
              const text = m.parts
                .map((p) => (p.type === "text" ? p.text : ""))
                .join("");
              return (
                <Message key={m.id} from={m.role}>
                  {m.role === "assistant" && (
                    <div className="mb-1 flex items-center gap-2 text-[11px] tracking-[0.18em] text-emerald-400/70 uppercase">
                      <Sparkles className="h-3 w-3" />
                      Cohere AI
                    </div>
                  )}
                  <MessageContent
                    className={
                      m.role === "user"
                        ? "group-[.is-user]:bg-gradient-to-br group-[.is-user]:from-emerald-500 group-[.is-user]:to-emerald-400 group-[.is-user]:text-black group-[.is-user]:shadow-[0_0_24px_rgba(16,185,129,0.35)]"
                        : ""
                    }
                  >
                    <MessageResponse>{text}</MessageResponse>
                  </MessageContent>
                </Message>
              );
            })
          )}

          {status === "submitted" && (
            <Message from="assistant">
              <div className="mb-1 flex items-center gap-2 text-[11px] tracking-[0.18em] text-emerald-400/70 uppercase">
                <Sparkles className="h-3 w-3" /> Cohere AI
              </div>
              <MessageContent>
                <Shimmer>Думаю...</Shimmer>
              </MessageContent>
            </Message>
          )}

          {error && (
            <div className="mx-auto mt-4 max-w-2xl rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
              Ошибка: {error.message}
            </div>
          )}
        </ConversationContent>
        <ConversationScrollButton className="bg-emerald-500/20 text-emerald-200 hover:bg-emerald-500/30" />
      </Conversation>

      <div className="border-t border-emerald-400/10 bg-black/40 px-4 py-4 backdrop-blur-xl">
        <div className="mx-auto w-full max-w-3xl">
          <PromptInput onSubmit={onSubmit} className="cohere-prompt">
            <PromptInputTextarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Напиши сообщение для Cohere AI…"
              disabled={loading}
            />
            <PromptInputFooter className="justify-between">
              <span className="text-[11px] tracking-[0.18em] text-white/40 uppercase">
                gemini · neural gateway
              </span>
              <PromptInputSubmit
                status={status}
                disabled={!input.trim() && !loading}
                className="bg-gradient-to-r from-emerald-500 to-emerald-400 text-black shadow-[0_0_18px_rgba(16,185,129,0.55)] hover:shadow-[0_0_28px_rgba(16,185,129,0.75)]"
              />
            </PromptInputFooter>
          </PromptInput>
        </div>
      </div>
    </div>
  );
}