
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { createUser, verifyUser } from "@/actions/auth";
import { Loader2 } from "lucide-react";
import { useApp } from "@/contexts/app-context";

const loginSchema = z.object({
    username: z.string().min(1, "Username is required"),
    password: z.string().min(1, "Password is required"),
});

const signupSchema = z.object({
    username: z.string().min(3, "Username must be at least 3 characters"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;
type SignupFormValues = z.infer<typeof signupSchema>;


export function AuthForm({ hasUsers }: { hasUsers: boolean }) {
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();
    const { loadInitialData } = useApp();

    const formSchema = hasUsers ? loginSchema : signupSchema;
    type FormValues = LoginFormValues | SignupFormValues;

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: { username: "", password: "" },
    });
    
    const onSubmit = async (data: FormValues) => {
        setIsLoading(true);
        let result;
        if (hasUsers) {
            result = await verifyUser(data.username, data.password);
        } else {
            result = await createUser(data.username, data.password);
        }

        if (result.success) {
            toast({
                title: hasUsers ? "Login Successful" : "Account Created",
                description: "Welcome! You are now logged in.",
            });
            // Reload the app's data and state without a hard refresh
            await loadInitialData();
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
                {hasUsers ? "Log In" : "Create Account"}
            </Button>
        </form>
    );
}
