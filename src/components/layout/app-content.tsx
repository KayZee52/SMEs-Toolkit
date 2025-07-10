
"use client";

import { usePathname, useRouter } from "next/navigation";
import { useApp } from "@/contexts/app-context";
import { AuthForm } from "@/components/auth/auth-form";
import { Sidebar, SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import SidebarNav from "@/components/layout/sidebar-nav";
import Header from "@/components/layout/header";
import { AIAssistant } from "@/components/ai/ai-assistant-sheet";
import { MaDIcon } from "@/components/ui/icons";
import { useEffect } from "react";

export default function AppContent({ children }: { children: React.ReactNode }) {
    const { isLoggedIn, isLoading } = useApp();
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        if (isLoading) return; // Don't do anything while loading

        // If user is not logged in and not on the auth page, redirect to auth page
        if (!isLoggedIn && pathname !== '/auth') {
            router.push('/auth');
        }

        // If user is logged in and on the auth page, redirect to dashboard
        if (isLoggedIn && pathname === '/auth') {
            router.push('/');
        }
    }, [isLoggedIn, isLoading, pathname, router]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-2xl">Loading...</div>
            </div>
        );
    }

    if (!isLoggedIn && pathname !== '/auth') {
        // This state is temporary while redirecting
        return (
             <div className="flex items-center justify-center min-h-screen">
                <div className="text-2xl">Redirecting to login...</div>
            </div>
        );
    }
    
    if (isLoggedIn && pathname === '/auth') {
        // This state is temporary while redirecting
        return (
             <div className="flex items-center justify-center min-h-screen">
                <div className="text-2xl">Redirecting to dashboard...</div>
            </div>
        );
    }

    // Render auth page if user is not logged in and on the right page
    if (!isLoggedIn && pathname === '/auth') {
        return <>{children}</>;
    }

    // User is logged in, show the main app layout for any other page
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

    return null; // Should not be reached, but as a fallback
}
