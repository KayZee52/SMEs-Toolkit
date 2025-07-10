
"use server"

import { db } from "@/lib/db";
import { AuthForm } from "@/components/auth/auth-form";
import { MaDIcon } from "@/components/ui/icons";

export default async function AuthPage() {
    const userCount = db.prepare("SELECT count(*) as count FROM users").get() as { count: number };
    const hasUsers = userCount.count > 0;

    return (
        <div className="flex items-center justify-center min-h-screen bg-background">
            <div className="w-full max-w-sm p-8 space-y-6">
                <div className="flex flex-col items-center text-center">
                    <MaDIcon className="w-16 h-16 mb-4" />
                    <h1 className="text-3xl font-bold font-headline">SMEs Toolkit</h1>
                    <p className="text-muted-foreground">
                        {hasUsers ? "Welcome back! Please log in to continue." : "Welcome! Create the first admin account."}
                    </p>
                </div>
                <AuthForm hasUsers={hasUsers} />
            </div>
        </div>
    );
}
