
"use client";

import { usePathname, useRouter } from "next/navigation";
import { useApp } from "@/contexts/app-context";
import { AuthForm } from "@/components/auth/auth-form";
import { Sidebar, SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import SidebarNav from "@/components/layout/sidebar-nav";
import Header from "@/components/layout/header";
import { AIAssistant } from "@/components/ai/ai-assistant-sheet";
import { MaDIcon } from "@/components/ui/icons";

export default function AppContent({ children }: { children: React.ReactNode }) {
    const { isLoggedIn, isLoading } = useApp();
    const pathname = usePathname();
    const router = useRouter();

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-2xl">Loading...</div>
            </div>
        )
    }

    if (!isLoggedIn && pathname !== '/auth') {
        if (typeof window !== 'undefined') {
            router.push('/auth');
        }
        return (
             <div className="flex items-center justify-center min-h-screen">
                <div className="text-2xl">Redirecting to login...</div>
            </div>
        );
    }
    
    if (!isLoggedIn && pathname === '/auth') {
        // Since we can't call a server component directly, we recreate the auth page UI here
        // This is a simplified version. A better approach might be a dedicated layout for auth.
        return (
             <div className="flex items-center justify-center min-h-screen bg-background">
                <div className="w-full max-w-sm p-8 space-y-6">
                    <div className="flex flex-col items-center text-center">
                        <MaDIcon className="w-16 h-16 mb-4" />
                        <h1 className="text-3xl font-bold font-headline">SMEs Toolkit</h1>
                        <p className="text-muted-foreground">
                            Welcome! Create the first admin account.
                        </p>
                    </div>
                    <AuthForm hasUsers={false} />
                </div>
            </div>
        )
    }
    
    if (isLoggedIn && pathname === '/auth') {
        if (typeof window !== 'undefined') {
            router.push('/');
        }
        return (
             <div className="flex items-center justify-center min-h-screen">
                <div className="text-2xl">Redirecting to dashboard...</div>
            </div>
        );
    }

    // User is logged in, show the main app layout
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
