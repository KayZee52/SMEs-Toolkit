
"use client";
import { useState, useRef, useEffect, type FormEvent } from "react";
import { User, Loader, X, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getAiReply, getCustomerInfoFromText } from "@/actions/ai";
import { useApp } from "@/contexts/app-context";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { MaDIcon } from "@/components/ui/icons";

type Message = {
  role: "user" | "assistant";
  content: string;
};

const suggestions = [
  "What were my total sales today?",
  "Which product is the most profitable?",
  "Forecast inventory for all products",
  "Write a marketing email for the Wool Scarf",
];

export function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { addCustomer, findCustomerByName, settings, products, sales } =
    useApp();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleQuery = async (query: string) => {
    if (!query.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: query };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Check for new customer info
    const customerInfoRes = await getCustomerInfoFromText(query);
    if (customerInfoRes.success && customerInfoRes.data?.customerName) {
      const existingCustomer = findCustomerByName(
        customerInfoRes.data.customerName
      );
      if (!existingCustomer) {
        addCustomer({
          name: customerInfoRes.data.customerName,
          phone: customerInfoRes.data.customerPhoneNumber,
        });
      }
    }

    const aiReplyRes = await getAiReply(query, { products, sales });
    if (aiReplyRes.success && aiReplyRes.data?.answer) {
      const assistantMessage: Message = {
        role: "assistant",
        content: aiReplyRes.data.answer,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } else {
      const defaultError = "Sorry, I couldn't process that request. Please try again.";
      const detailedError = aiReplyRes.error || defaultError;
      const errorMessage: Message = {
        role: "assistant",
        content: detailedError,
      };
      setMessages((prev) => [...prev, errorMessage]);
    }

    setIsLoading(false);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleQuery(input);
  };

  useEffect(() => {
    if (scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
      if (viewport) {
        viewport.scrollTo({ top: viewport.scrollHeight, behavior: 'smooth' });
      }
    }
  }, [messages]);

  // If the setting to enable the assistant is toggled off, close the sheet.
  useEffect(() => {
    if (!settings.enableAssistant) {
      setIsOpen(false);
    }
  }, [settings.enableAssistant]);

  return (
    <>
      {settings.enableAssistant && (
        <div className="fixed bottom-6 right-6 z-50">
          <AnimatePresence>
            {!isOpen && (
              <motion.div
                initial={{ scale: 0, y: 50 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0, y: 50 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
              >
                <Button
                  onClick={() => setIsOpen(true)}
                  className="rounded-full w-16 h-16 shadow-lg shadow-primary/40 bg-accent text-accent-foreground hover:bg-accent/90"
                  size="icon"
                >
                  <MaDIcon className="w-8 h-8" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent className="flex flex-col p-0">
          <SheetHeader className="p-4 flex flex-row justify-between items-center text-left border-b">
            <SheetTitle className="font-futuristic text-lg tracking-wider flex items-center gap-2">
              <MaDIcon className="w-5 h-5 text-primary" />
              Ma-D <span className="text-primary font-normal">AI Assistant</span>
            </SheetTitle>
            <SheetClose asChild>
              <Button variant="ghost" size="icon">
                <X className="h-4 w-4" />
              </Button>
            </SheetClose>
          </SheetHeader>
          <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-full" ref={scrollAreaRef}>
              <div className="p-4 space-y-6">
                {messages.length === 0 && !isLoading && settings.autoSuggestions && (
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Try one of these suggestions:
                    </p>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {suggestions.map((suggestion, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          className="h-auto whitespace-normal text-left justify-start"
                          onClick={() => handleQuery(suggestion)}
                        >
                          {suggestion}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={cn(
                      "flex items-start gap-3",
                      message.role === "user" ? "justify-end" : ""
                    )}
                  >
                    {message.role === "assistant" && (
                      <Avatar className="h-8 w-8 border">
                        <AvatarFallback className="bg-primary/20 text-primary">
                          <MaDIcon className="w-5 h-5" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={cn(
                        "rounded-xl px-4 py-3 max-w-[85%] text-sm",
                        message.role === "user"
                          ? "bg-accent text-accent-foreground rounded-br-none"
                          : "bg-muted rounded-bl-none"
                      )}
                    >
                      <p>{message.content}</p>
                    </div>
                    {message.role === "user" && (
                      <Avatar className="h-8 w-8 border">
                        <AvatarFallback>
                          <User size={20} />
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))}
                {isLoading && (
                  <div className="flex items-start gap-3">
                    <Avatar className="h-8 w-8 border">
                      <AvatarFallback className="bg-primary/20 text-primary">
                        <MaDIcon className="w-5 h-5" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="rounded-lg px-4 py-2 bg-muted flex items-center">
                      <Loader className="animate-spin h-5 w-5" />
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          <form onSubmit={handleSubmit} className="relative m-4 shrink-0">
            <Input
              value={input}
              onChange={handleInputChange}
              placeholder="e.g., Sold one silk tie..."
              className="pr-12 h-12 text-base"
              disabled={isLoading}
            />
            <Button
              type="submit"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9 bg-accent hover:bg-accent/90"
              disabled={isLoading || !input.trim()}
            >
              <Send size={18} />
            </Button>
          </form>
        </SheetContent>
      </Sheet>
    </>
  );
}
