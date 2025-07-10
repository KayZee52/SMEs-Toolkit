
"use client";

import { usePathname } from "next/navigation";
import { useApp } from "@/contexts/app-context";
import { Sidebar, SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import SidebarNav from "@/components/layout/sidebar-nav";
import Header from "@/components/layout/header";
import { AIAssistant } from "@/components/ai/ai-assistant-sheet";

export default function AppContent({ children }: { children: React.ReactNode }) {
    const { isLoggedIn, isLoading } = useApp();
    const pathname = usePathname();

    // While the session is being checked, show a loading screen.
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-2xl">Loading...</div>
            </div>
        );
    }
    
    // If on the auth page, just render the auth form. Middleware handles redirects.
    if (pathname === '/auth') {
        return <>{children}</>;
    }

    // If logged in, show the main application layout with sidebar and header.
    if (isLoggedIn) {
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

    // If not logged in and not on the auth page, middleware will redirect.
    // Show a loading screen in the meantime.
    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="text-2xl">Loading...</div>
        </div>
    );
}
