
"use client";

import { usePathname } from "next/navigation";
import { useApp } from "@/contexts/app-context";

export function AuthLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { isLoggedIn, isLoading } = useApp();

    if(pathname === "/auth") {
        return <>{children}</>
    }

    if (isLoading || isLoggedIn === null) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-2xl">Loading...</div>
            </div>
        )
    }

    return <>{children}</>;
}
