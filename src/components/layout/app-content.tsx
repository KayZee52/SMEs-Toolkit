
"use client";

import { useApp } from "@/contexts/app-context";
import { Sidebar, SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import SidebarNav from "@/components/layout/sidebar-nav";
import Header from "@/components/layout/header";
import { AIAssistant } from "@/components/ai/ai-assistant-sheet";

export default function AppContent({ children }: { children: React.ReactNode }) {
    const { isLoading } = useApp();

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-2xl">Loading...</div>
            </div>
        );
    }
    
    return (
        <SidebarProvider>
            <Sidebar>
                <SidebarNav />
            </Sidebar>
            <SidebarInset className="flex flex-col">
                <Header />
                <main className="flex-1 p-4 md:p-6">{children}</main>
            </SidebarInset>
            <AIAssistant />
        </SidebarProvider>
    )
}
