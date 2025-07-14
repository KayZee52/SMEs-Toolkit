
"use client";

import { useState } from "react";
import { useApp } from "@/contexts/app-context";
import { MaDIcon } from "@/components/ui/icons";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export function LoginPage() {
  const { login, setPassword, isAuthRequired, recreateDatabase } = useApp();
  const { toast } = useToast();

  const [password, setPasswordState] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const isSetupMode = !isAuthRequired;

  const handleLogin = async () => {
    if (!password) return;
    setIsLoading(true);
    await login(password);
    setIsLoading(false);
  };
  
  const handleSetup = async () => {
    if (password.length < 4) {
      toast({
        variant: "destructive",
        title: "Password is too short",
        description: "Please use at least 4 characters.",
      });
      return;
    }
    if (password !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Passwords do not match",
        description: "Please ensure the passwords are the same.",
      });
      return;
    }
    setIsLoading(true);
    await setPassword(password);
    // The context will handle setting isAuthenticated to true
    setIsLoading(false);
  };

  const handleForgotPassword = async () => {
    setIsLoading(true);
    await recreateDatabase();
    // The app will reload automatically via the context's implementation
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSetupMode) {
      handleSetup();
    } else {
      handleLogin();
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm">
        <form onSubmit={handleSubmit}>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <MaDIcon className="h-10 w-10 text-primary" />
            </div>
            <CardTitle className="font-headline text-2xl">
              {isSetupMode ? "Secure Your Application" : "Welcome Back"}
            </CardTitle>
            <CardDescription>
              {isSetupMode 
                ? "Create a password to protect your business data. You'll need this to log in."
                : "Please enter your password to access your dashboard."
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">{isSetupMode ? "Create Password" : "Password"}</Label>
                {!isSetupMode && (
                   <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="link" type="button" className="p-0 h-auto text-xs">
                          Forgot Password?
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete all your sales, products, customers, and expenses.
                            <br/><br/>
                            <span className="font-semibold text-foreground">Your API key will be preserved.</span>
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            asChild
                          >
                             <Button
                                variant="destructive"
                                onClick={handleForgotPassword}
                              >
                                  Yes, reset everything
                              </Button>
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                )}
              </div>
              <Input 
                id="password" 
                type="password" 
                value={password}
                onChange={(e) => setPasswordState(e.target.value)}
                required 
              />
            </div>
            {isSetupMode && (
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input 
                  id="confirm-password" 
                  type="password" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required 
                />
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button className="w-full" type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSetupMode ? "Save Password & Login" : "Login"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
