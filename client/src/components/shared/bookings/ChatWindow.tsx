"use client";

import { useEffect, useRef, useState } from "react";
import { useChat } from "@/components/providers/chat-provider";
import { useAuth } from "@/hooks/use_auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Send, Camera, Info, Search, CheckCheck, Loader2, ArrowDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

// I'll check if scroll-area exists, if not I'll use a div with overflow-y-auto
// I didn't see scroll-area.tsx in the list.

interface ChatWindowProps {
  bookingId: string;
  className?: string;
  counterparty?: {
    name: string;
    role: "RENTER" | "HOST" | "COMPANY";
    avatar?: string;
  };
}

export function ChatWindow({ bookingId, className, counterparty }: ChatWindowProps) {
  const { messages, sendMessage, joinRoom, isConnected, isLoading } = useChat();
  const { user } = useAuth();
  const [inputValue, setInputValue] = useState("");
  const [showScrollButton, setShowScrollButton] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    joinRoom(bookingId);
  }, [bookingId, joinRoom]);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      // Show button if we are more than 200px from the bottom
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 200;
      setShowScrollButton(!isNearBottom);
    }
  };

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim()) return;
    
    const content = inputValue;
    setInputValue("");
    await sendMessage(bookingId, content);
  };

  return (
    <Card className={cn("flex flex-col h-full border rounded-2xl overflow-hidden bg-background shadow-sm", className)}>
      {/* Header */}
      <div className="p-4 border-b bg-card/50 backdrop-blur-sm flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10 border shadow-sm">
            <AvatarImage src={counterparty?.avatar} />
            <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
              {counterparty?.name?.split(" ").map(n => n[0]).join("").toUpperCase() || "CH"}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-bold tracking-tight text-sm flex items-center gap-2">
              {counterparty?.name || "Chat"}
              {counterparty?.role && (
                <Badge variant="outline" className="text-[9px] font-black tracking-widest px-1.5 py-0 bg-primary/5 border-primary/20 text-primary">
                  {counterparty.role}
                </Badge>
              )}
            </h3>
            <div className="flex items-center gap-1.5">
              <div className={cn("w-1.5 h-1.5 rounded-full", isConnected ? "bg-green-500" : "bg-zinc-300")} />
              <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                {isLoading ? "Syncing..." : (isConnected ? "Active Now" : "Disconnected")}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {isLoading && <Loader2 className="w-4 h-4 text-primary animate-spin mr-2" />}
          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full text-muted-foreground">
            <Search className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full text-muted-foreground">
            <Info className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 relative overflow-visible min-h-0">
        <div 
          ref={scrollRef}
          onScroll={handleScroll}
          className="h-full overflow-y-auto p-4 space-y-4 bg-muted/5 scroll-smooth custom-scrollbar"
        >
        {isLoading && messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center space-y-4">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Loading messages...</p>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isMe = msg.senderId === user?.id;
            const isSystem = msg.senderType === "System";
            const showAvatar = idx === 0 || messages[idx-1].senderId !== msg.senderId;

            if (isSystem) {
              return (
                <div key={msg.id} className="flex justify-center my-4">
                  <div className="bg-background/80 backdrop-blur-sm border px-3 py-1 rounded-full text-[9px] font-bold text-muted-foreground uppercase tracking-widest shadow-sm">
                    {msg.content}
                  </div>
                </div>
              );
            }

            return (
              <div
                key={msg.id}
                className={cn(
                  "flex items-end gap-2 max-w-[85%] animate-in fade-in slide-in-from-bottom-2 duration-300",
                  isMe ? "ml-auto flex-row-reverse" : "mr-auto"
                )}
              >
                {!isMe && showAvatar && (
                  <Avatar className="w-8 h-8 border shadow-sm shrink-0 mb-1">
                    <AvatarImage src={counterparty?.avatar} />
                    <AvatarFallback className="text-[10px] font-bold bg-muted text-muted-foreground">
                      {counterparty?.name?.split(" ").map(n => n[0]).join("").toUpperCase() || "TH"}
                    </AvatarFallback>
                  </Avatar>
                )}
                {!isMe && !showAvatar && <div className="w-8 shrink-0" />}
                
                <div className={cn("flex flex-col gap-1", isMe ? "items-end" : "items-start")}>
                  {showAvatar && !isMe && (
                    <span className="text-[10px] font-bold text-muted-foreground px-1 uppercase tracking-tight">
                      {counterparty?.name || "Them"}
                    </span>
                  )}
                  <div
                    className={cn(
                      "relative px-4 py-2.5 text-sm font-medium leading-relaxed shadow-sm max-w-md transition-colors",
                      isMe 
                        ? "bg-primary text-primary-foreground rounded-2xl rounded-tr-none shadow-primary/10" 
                        : "bg-muted/50 text-foreground rounded-2xl rounded-tl-none border-border/50 shadow-sm"
                    )}
                  >
                    {msg.content}
                    <div className={cn(
                      "text-[9px] font-medium mt-1 opacity-60 flex items-center gap-1",
                      isMe ? "justify-end" : "justify-start"
                    )}>
                      {format(new Date(msg.createdAt), "HH:mm")}
                      {isMe && <CheckCheck className="w-3 h-3" />}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
        </div>
        
        {/* Scroll to bottom button */}
        {showScrollButton && (
          <Button
            size="icon"
            variant="secondary"
            className="absolute bottom-4 right-4 rounded-full shadow-lg border animate-in fade-in slide-in-from-bottom-4"
            onClick={scrollToBottom}
          >
            <ArrowDown className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Input Area */}
      <form 
        onSubmit={handleSend}
        className="p-6 border-t bg-card flex gap-4"
      >
        <Button 
          type="button" 
          variant="outline" 
          size="icon" 
          className="w-12 h-12 border shadow-sm rounded-xl"
        >
          <Camera className="w-5 h-5 text-muted-foreground" />
        </Button>
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 h-12 border focus-visible:ring-primary/20 placeholder:text-muted-foreground text-sm"
        />
        <Button 
          type="submit"
          disabled={!inputValue.trim()}
          className="h-12 px-6 bg-primary text-primary-foreground hover:bg-primary/90 font-bold shadow-sm"
        >
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </Card>
  );
}
