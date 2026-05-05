"use client";

import { type FormEvent, useEffect, useRef, useState } from "react";
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
};

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
  },
];

function buildAssistantReply(prompt: string) {
  const normalizedPrompt = prompt.trim().toLowerCase();

  if (
    normalizedPrompt.includes("airport") ||
    normalizedPrompt.includes("flight") ||
    normalizedPrompt.includes("pickup")
  ) {
    return "Airport transfers are a strong fit here. Check the Airport Transfers row for convenient pickup options, then open the car page to confirm availability and pricing.";
  }

  if (
    normalizedPrompt.includes("family") ||
    normalizedPrompt.includes("space") ||
    normalizedPrompt.includes("group") ||
    normalizedPrompt.includes("suv") ||
    normalizedPrompt.includes("van")
  ) {
    return "For family or group travel, start with the SUVs and Vans section. Look for more seats, luggage room, and compare daily rates before booking.";
  }

  if (
    normalizedPrompt.includes("budget") ||
    normalizedPrompt.includes("cheap") ||
    normalizedPrompt.includes("affordable") ||
    normalizedPrompt.includes("low price")
  ) {
    return "The Community Hosted Vehicles list is usually the best place to start for budget-friendly options. It gives you a strong mix of price, flexibility, and local hosts.";
  }

  if (
    normalizedPrompt.includes("luxury") ||
    normalizedPrompt.includes("business") ||
    normalizedPrompt.includes("premium")
  ) {
    return "The Luxury Fleet section is your best match. It is better for premium comfort, business travel, and more polished arrivals.";
  }

  if (
    normalizedPrompt.includes("host") ||
    normalizedPrompt.includes("rent out") ||
    normalizedPrompt.includes("list my car")
  ) {
    return "If you want to earn with your vehicle, the next step is creating an account and starting the host flow. After verification, you can list your car and manage bookings from the dashboard.";
  }

  return "A smart starting point is the featured car rows on the landing page. Ask for a budget, trip type, or vehicle style and I will narrow it down for you.";
}

export function LandingChatbot() {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [draft, setDraft] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isThinking]);

  const submitPrompt = (rawPrompt: string) => {
    const prompt = rawPrompt.trim();
    if (!prompt) return;

    setMessages((current) => [
      ...current,
      {
        id: Date.now(),
        role: "user",
        content: prompt,
      },
    ]);
    setDraft("");
    setIsThinking(true);

    window.setTimeout(() => {
      setMessages((current) => [
        ...current,
        {
          id: Date.now() + 1,
          role: "assistant",
          content: buildAssistantReply(prompt),
        },
      ]);
      setIsThinking(false);
    }, 450);
  };

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
                  <div
                    key={message.id}
                    className={cn(
                      "flex",
                      message.role === "user"
                        ? "justify-end"
                        : "justify-start",
                    )}
                  >
                    <div
                      className={cn(
                        "shadow-sm px-4 py-3 rounded-3xl max-w-[88%] text-sm leading-6",
                        message.role === "user"
                          ? "rounded-br-md bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                          : "rounded-bl-md bg-muted text-foreground",
                      )}
                    >
                      {message.content}
                    </div>
                  </div>
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
                        onClick={() => submitPrompt(prompt)}
                        className="bg-background hover:bg-accent px-3 py-2 border border-border/70 rounded-full font-medium text-foreground text-xs transition-colors"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>

                <div ref={endRef} />
              </div>

              <div className="bg-background px-6 py-4 border-border/60 border-t">
                <form
                  onSubmit={handleSubmit}
                  className="flex items-center gap-2"
                >
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
