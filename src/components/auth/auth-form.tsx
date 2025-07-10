
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { verifyUser } from "@/actions/auth";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

const loginSchema = z.object({
    username: z.string().min(1, "Username is required"),
    password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function AuthForm() {
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();
    const router = useRouter();

    const form = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: { username: "admin", password: "" },
    });
    
    const onSubmit = async (data: LoginFormValues) => {
        setIsLoading(true);
        const result = await verifyUser(data.username, data.password);

        if (result.success) {
            toast({
                title: "Login Successful",
                description: "Welcome! Redirecting you to the dashboard.",
            });
            router.refresh();
        } else {
            toast({
                variant: "destructive",
                title: "Authentication Failed",
                description: result.error,
            });
            setIsLoading(false);
        }
    };
    
    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input id="username" {...form.register("username")} disabled={isLoading} />
                {form.formState.errors.username && (
                    <p className="text-sm text-destructive">
                        {form.formState.errors.username.message}
                    </p>
                )}
            </div>
            <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" {...form.register("password")} disabled={isLoading} />
                {form.formState.errors.password && (
                    <p className="text-sm text-destructive">
                        {form.formState.errors.password.message}
                    </p>
                )}
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Log In
            </Button>
        </form>
    );
}
