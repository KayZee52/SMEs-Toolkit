
"use client";

import { usePathname, useRouter } from "next/navigation";
import { useApp } from "@/contexts/app-context";
import { Sidebar, SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import SidebarNav from "@/components/layout/sidebar-nav";
import Header from "@/components/layout/header";
import { AIAssistant } from "@/components/ai/ai-assistant-sheet";
import { useEffect } from "react";

export default function AppContent({ children }: { children: React.ReactNode }) {
    const { isLoggedIn, isLoading } = useApp();
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        if (isLoading) return;

        if (!isLoggedIn && pathname !== '/auth') {
            router.push('/auth');
        } else if (isLoggedIn && pathname === '/auth') {
            router.push('/');
        }
    }, [isLoggedIn, isLoading, pathname, router]);

    // While loading or if a redirect is imminent, show a loading screen.
    if (isLoading || (!isLoggedIn && pathname !== '/auth') || (isLoggedIn && pathname === '/auth')) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-2xl">Loading...</div>
            </div>
        );
    }
    
    // If not logged in and on the auth page, show the auth page.
    if (!isLoggedIn && pathname === '/auth') {
        return <>{children}</>;
    }

    // If logged in, show the main application layout.
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

    // Fallback, should not be reached.
    return null;
}
