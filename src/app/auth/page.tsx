
"use server"

import { AuthForm } from "@/components/auth/auth-form";
import { MaDIcon } from "@/components/ui/icons";

export default async function AuthPage() {
    return (
        <div className="flex items-center justify-center min-h-screen bg-background">
            <div className="w-full max-w-sm p-8 space-y-6">
                <div className="flex flex-col items-center text-center">
                    <MaDIcon className="w-16 h-16 mb-4" />
                    <h1 className="text-3xl font-bold font-headline">SMEs Toolkit</h1>
                    <p className="text-muted-foreground">
                        Welcome! Please log in to continue.
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                        (Default: <span className="font-mono">admin</span> / <span className="font-mono">password</span>)
                    </p>
                </div>
                <AuthForm />
            </div>
        </div>
    );
}
