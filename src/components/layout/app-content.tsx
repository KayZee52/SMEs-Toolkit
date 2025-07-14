
"use client";

import { useApp } from "@/contexts/app-context";
import { Sidebar, SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import SidebarNav from "@/components/layout/sidebar-nav";
import Header from "@/components/layout/header";
import { AIAssistant } from "@/components/ai/ai-assistant-sheet";
import { LoginPage } from "@/components/auth/login-page";
import { Loader2 } from "lucide-react";

export default function AppContent({ children }: { children: React.ReactNode }) {
    const { isLoading, isAuthenticated, isAuthRequired } = useApp();

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-muted-foreground">Loading your business data...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated && isAuthRequired) {
        return <LoginPage />;
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
