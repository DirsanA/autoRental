"use client";

import { type FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { Bot, MessageSquareText, Send, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

type ChatMessage = {
  id: number;
  role: "assistant" | "user";
  content: string;
  isTyping?: boolean;
};

type ChatApiResponse = {
  content?: string;
  error?: string;
  fallback?: boolean;
  reason?: string;
};

function useTypingAnimation(
  fullText: string,
  isTyping: boolean,
  onComplete: () => void,
  wordsPerSecond = 8,
) {
  const [displayedText, setDisplayedText] = useState("");
  const wordsRef = useRef<string[]>([]);
  const currentIndexRef = useRef(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isTyping) return;

    wordsRef.current = fullText.split(/(\s+)/);
    currentIndexRef.current = 0;

    const wordDelay = 1000 / wordsPerSecond;

    const typeNext = () => {
      if (currentIndexRef.current >= wordsRef.current.length) {
        onComplete();
        return;
      }

      const nextWords = wordsRef.current.slice(0, currentIndexRef.current + 1);
      setDisplayedText(nextWords.join(""));
      currentIndexRef.current++;

      const randomDelay = wordDelay * (0.8 + Math.random() * 0.4);
      timeoutRef.current = setTimeout(typeNext, randomDelay);
    };

    timeoutRef.current = setTimeout(typeNext, 300);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [fullText, isTyping, onComplete, wordsPerSecond]);

  return isTyping ? displayedText : fullText;
}

const STARTER_PROMPTS = [
  "Show me family-friendly SUVs",
  "I need an airport pickup car",
  "Find the best budget options",
];

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 1,
    role: "assistant",
    content:
      "Hi, I am your AutoRent assistant. Tell me what kind of trip or car you have in mind, and I will point you in the right direction.",
    isTyping: false,
  },
];

const SYSTEM_PROMPT =
  "You are AutoRent Assistant, a helpful chatbot for a car rental marketplace website. Ask brief clarifying questions when needed, suggest suitable car categories (SUV, van, budget, luxury, airport pickup), and keep answers concise and actionable.";

async function fetchAssistantReply(conversation: ChatMessage[]) {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...conversation.map((message) => ({
          role: message.role,
          content: message.content,
        })),
      ],
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Request failed with status ${res.status}`);
  }

  const data = (await res.json()) as ChatApiResponse;

  if (data.fallback) {
    throw new Error(
      data.error ||
        `Assistant fallback triggered${data.reason ? `: ${data.reason}` : "."}`,
    );
  }

  if (!data.content) {
    throw new Error("Empty assistant response.");
  }

  return data.content;
}

function ChatMessageBubble({
  message,
  isCurrentlyTyping,
  onTypingComplete,
}: {
  message: ChatMessage;
  isCurrentlyTyping: boolean;
  onTypingComplete: () => void;
}) {
  const displayedContent = useTypingAnimation(
    message.content,
    isCurrentlyTyping,
    onTypingComplete,
    12,
  );

  return (
    <div
      className={cn(
        "flex",
        message.role === "user" ? "justify-end" : "justify-start",
      )}
    >
      <div
        className={cn(
          "shadow-sm px-4 py-3 rounded-3xl max-w-[88%] text-sm leading-6 relative",
          message.role === "user"
            ? "rounded-br-md bg-slate-900 text-white dark:bg-white dark:text-slate-900"
            : "rounded-bl-md bg-muted text-foreground",
        )}
      >
        {displayedContent}
        {isCurrentlyTyping && (
          <span className="inline-block w-2 h-4 ml-1 bg-current animate-pulse" />
        )}
      </div>
    </div>
  );
}

export function LandingChatbot() {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [draft, setDraft] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [typingMessageId, setTypingMessageId] = useState<number | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isThinking, typingMessageId]);

  const submitPrompt = async (rawPrompt: string) => {
    const prompt = rawPrompt.trim();
    if (!prompt || isThinking) return;

    const userMessage: ChatMessage = {
      id: Date.now(),
      role: "user",
      content: prompt,
    };

    const nextConversation = [...messages, userMessage];
    setMessages(nextConversation);
    setDraft("");
    setIsThinking(true);

    try {
      const content = await fetchAssistantReply(nextConversation);
      const newMessageId = Date.now() + 1;
      setMessages((current) => [
        ...current,
        { id: newMessageId, role: "assistant", content, isTyping: true },
      ]);
      setTypingMessageId(newMessageId);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "I could not reach the assistant service right now. Please try again in a moment.";
      const errorMessageId = Date.now() + 1;
      setMessages((current) => [
        ...current,
        {
          id: errorMessageId,
          role: "assistant",
          content: `Sorry, ${message}`,
          isTyping: true,
        },
      ]);
      setTypingMessageId(errorMessageId);
    } finally {
      setIsThinking(false);
    }
  };

  const handleTypingComplete = useCallback((messageId: number) => {
    setTypingMessageId((current) => (current === messageId ? null : current));
    setMessages((current) =>
      current.map((message) =>
        message.id === messageId ? { ...message, isTyping: false } : message,
      ),
    );
  }, []);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    submitPrompt(draft);
  };

  return (
    <div
      className={cn(
        "bottom-0 z-40 fixed inset-x-0 flex justify-end p-4 pointer-events-none",
        "pb-[max(1rem,env(safe-area-inset-bottom))] sm:p-6 sm:pb-[max(1.25rem,env(safe-area-inset-bottom))]",
      )}
    >
      <div className="pointer-events-auto">
        <Sheet>
          <SheetTrigger asChild>
            <Button
              type="button"
              size="icon"
              variant="default"
              title="Open assistant"
              aria-label="Open AutoRent assistant"
              className={cn(
                "relative shadow-lg border border-white/10 rounded-full w-14 h-14",
                "bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 text-white",
                "hover:from-slate-800 hover:via-slate-800 hover:to-slate-700 hover:shadow-xl",
                "dark:border-slate-800/80 dark:from-white dark:via-white dark:to-slate-100 dark:text-slate-900",
                "dark:hover:from-slate-100 dark:hover:via-white dark:hover:to-white",
                "ring-1 ring-black/5 dark:ring-white/20",
                "transition-all duration-200 hover:scale-[1.03] active:scale-[0.97]",
                "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              )}
            >
              <span
                aria-hidden="true"
                className={cn(
                  "absolute -inset-2 opacity-100 rounded-full pointer-events-none",
                  "bg-slate-900/15 dark:bg-white/15",
                  "motion-safe:animate-[ping_2.5s_cubic-bezier(0.16,1,0.3,1)_infinite]",
                )}
              />
              <Bot className="w-6 h-6" strokeWidth={1.75} />
            </Button>
          </SheetTrigger>

          <SheetContent
            side="right"
            className="bg-background p-0 border-border/60 border-l w-full sm:max-w-md overflow-hidden"
          >
            <div className="flex flex-col h-full">
              <SheetHeader className="bg-gradient-to-b from-slate-50 dark:from-slate-950/40 via-background to-background px-6 py-5 border-border/60 border-b text-left">
                <div className="flex items-center gap-3">
                  <div className="flex justify-center items-center bg-slate-900 dark:bg-white shadow-sm rounded-2xl w-11 h-11 text-white dark:text-slate-900">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <SheetTitle className="font-semibold text-xl">
                      AutoRent Assistant
                    </SheetTitle>
                    <SheetDescription className="pt-1 text-sm leading-5">
                      Smart, simple help for choosing the right car faster.
                    </SheetDescription>
                  </div>
                </div>
              </SheetHeader>

              <div className="px-6 py-4 border-border/60 border-b">
                <div className="bg-muted/40 p-4 border border-border/70 rounded-3xl">
                  <div className="flex items-center gap-3">
                    <div className="flex justify-center items-center bg-background shadow-sm rounded-2xl w-10 h-10">
                      <MessageSquareText className="w-4 h-4 text-foreground" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground text-sm">
                        Ask naturally
                      </p>
                      <p className="text-muted-foreground text-xs leading-5">
                        Try budget, luxury, airport pickup, family cars, or
                        weekend trip ideas.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex-1 space-y-4 px-6 py-5 overflow-y-auto">
                {messages.map((message) => (
                  <ChatMessageBubble
                    key={message.id}
                    message={message}
                    isCurrentlyTyping={typingMessageId === message.id}
                    onTypingComplete={() => handleTypingComplete(message.id)}
                  />
                ))}

                {isThinking ? (
                  <div className="flex justify-start">
                    <div className="bg-muted shadow-sm px-4 py-3 rounded-3xl rounded-bl-md text-muted-foreground text-sm">
                      Thinking of the best match for you...
                    </div>
                  </div>
                ) : null}

                <div className="space-y-2 pt-2">
                  <p className="font-semibold text-muted-foreground text-xs uppercase tracking-[0.18em]">
                    Try one of these
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {STARTER_PROMPTS.map((prompt) => (
                      <button
                        key={prompt}
                        type="button"
                        disabled={isThinking}
                        onClick={() => submitPrompt(prompt)}
                        className="bg-background disabled:opacity-60 hover:bg-accent px-3 py-2 border border-border/70 rounded-full font-medium text-foreground text-xs transition-colors"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>

                <div ref={endRef} />
              </div>

              <div className="bg-background px-6 py-4 border-border/60 border-t">
                <form onSubmit={handleSubmit} className="flex items-center gap-2">
                  <Input
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    placeholder="Ask about budget, airport pickup, or trip type"
                    className="bg-muted/40 px-4 border-border/70 rounded-full h-11"
                  />
                  <Button
                    type="submit"
                    size="icon"
                    disabled={isThinking || !draft.trim()}
                    className="bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 rounded-full w-11 h-11 text-white dark:text-slate-900"
                  >
                    <Send className="w-4 h-4" />
                    <span className="sr-only">Send message</span>
                  </Button>
                </form>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
