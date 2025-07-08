"use client";
import { useState, useRef, useEffect, type ReactNode } from "react";
import { Bot, User, CornerDownLeft, Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getAiReply, getCustomerInfoFromText } from "@/actions/ai";
import { useApp } from "@/contexts/app-context";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export function AIAssistantSheet({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { addCustomer, findCustomerByName } = useApp();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Check for new customer info
    const customerInfoRes = await getCustomerInfoFromText(input);
    if (customerInfoRes.success && customerInfoRes.data?.customerName) {
        const existingCustomer = findCustomerByName(customerInfoRes.data.customerName);
        if (!existingCustomer) {
            addCustomer({
                name: customerInfoRes.data.customerName,
                phone: customerInfoRes.data.customerPhoneNumber,
            });
        }
    }

    const aiReplyRes = await getAiReply(input);
    if (aiReplyRes.success && aiReplyRes.data?.answer) {
      const assistantMessage: Message = {
        role: "assistant",
        content: aiReplyRes.data.answer,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } else {
       const errorMessage: Message = {
        role: "assistant",
        content: "Sorry, I couldn't process that request. Please try again.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    }

    setIsLoading(false);
  };

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  return (
    <Sheet>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="flex flex-col">
        <SheetHeader>
          <SheetTitle className="font-headline">AI Assistant</SheetTitle>
          <SheetDescription className="font-body">
            Ask about sales, inventory, or log new activities.
          </SheetDescription>
        </SheetHeader>
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full" ref={scrollAreaRef}>
            <div className="p-4 space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex items-start gap-3 ${
                    message.role === "user" ? "justify-end" : ""
                  }`}
                >
                  {message.role === "assistant" && (
                    <Avatar className="h-8 w-8">
                       <AvatarFallback className="bg-primary text-primary-foreground"><Bot size={20} /></AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={`rounded-lg px-4 py-2 max-w-[80%] ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                  </div>
                   {message.role === "user" && (
                     <Avatar className="h-8 w-8">
                       <AvatarFallback><User size={20} /></AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
               {isLoading && (
                <div className="flex items-start gap-3">
                   <Avatar className="h-8 w-8">
                       <AvatarFallback className="bg-primary text-primary-foreground"><Bot size={20} /></AvatarFallback>
                    </Avatar>
                  <div className="rounded-lg px-4 py-2 bg-muted flex items-center">
                    <Loader className="animate-spin h-5 w-5" />
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
        <form
          onSubmit={handleSubmit}
          className="relative mt-auto"
        >
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder="e.g., Sold one silk tie to Jane Doe..."
            className="pr-12"
            disabled={isLoading}
          />
          <Button
            type="submit"
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
            disabled={isLoading}
          >
            <CornerDownLeft size={16} />
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
