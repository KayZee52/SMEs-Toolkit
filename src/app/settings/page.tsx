
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Building, Languages, Save, Lock, AlertTriangle, DatabaseZap, ShieldCheck, History, KeyRound, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useApp } from "@/contexts/app-context";
import type { Settings } from "@/lib/types";
import { MaDIcon } from "@/components/ui/icons";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";


export default function SettingsPage() {
  const { settings: globalSettings, updateSettings, recreateDatabase, restoreDatabase, isAuthRequired, verifyPassword, backupExists, setPassword } = useApp();
  const { toast } = useToast();

  const [settings, setSettings] = useState<Settings>(globalSettings);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [deleteConfirmationPassword, setDeleteConfirmationPassword] = useState("");

  useEffect(() => {
    setSettings(globalSettings);
  }, [globalSettings]);

  const handleInputChange = (field: keyof Settings, value: string | boolean) => {
    setSettings(prev => ({ ...prev, [field]: value as any }));
  };

  const handleSave = () => {
    updateSettings(settings);
  };

  const handleDiscard = () => {
    setSettings(globalSettings);
    toast({
      title: "Changes Discarded",
      description: "Your pending changes have been discarded.",
    });
  };
  
  const handlePasswordChange = () => {
    if (newPassword !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Passwords do not match",
        description: "Please ensure both password fields are identical.",
      });
      return;
    }
    if (newPassword.length < 4) {
        toast({
            variant: "destructive",
            title: "Password is too short",
            description: "Password must be at least 4 characters long.",
        });
        return;
    }
    setPassword(newPassword);
    setNewPassword("");
    setConfirmPassword("");
  };
  
  const handleRecreateDatabase = async () => {
      if(isAuthRequired) {
        const isPasswordCorrect = await verifyPassword(deleteConfirmationPassword);
        if (!isPasswordCorrect) {
            toast({
                variant: "destructive",
                title: "Incorrect Password",
                description: "Database was not recreated. Please try again.",
            });
            return;
        }
      }
      await recreateDatabase();
  }

  const handleRestoreDatabase = async () => {
      await restoreDatabase();
  }

  const hasSettingsChanges = JSON.stringify(settings) !== JSON.stringify(globalSettings);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-headline text-3xl font-bold tracking-tight">
          Settings
        </h1>
         {hasSettingsChanges && (
            <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={handleDiscard}>
                Discard
                </Button>
                <Button onClick={handleSave}>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
                </Button>
            </div>
        )}
      </div>

       <Alert>
          <KeyRound className="h-4 w-4" />
          <AlertTitle>API Key Management</AlertTitle>
          <AlertDescription>
            The Google AI API Key is now managed in the project's <strong>.env</strong> file. You can edit this file in the file explorer to add or change your key.
          </AlertDescription>
        </Alert>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Business Info Card */}
        <Card className="lg:col-span-1">
          <CardHeader className="flex flex-row items-center gap-4">
            <Building className="h-6 w-6" />
            <div>
              <CardTitle className="font-headline">Business Info</CardTitle>
              <CardDescription>Manage your business profile.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="business-name">Business Name</Label>
              <Input 
                id="business-name" 
                value={settings.businessName}
                onChange={(e) => handleInputChange('businessName', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select 
                value={settings.currency}
                onValueChange={(value) => handleInputChange('currency', value)}
              >
                <SelectTrigger id="currency">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="LRD">LRD (L$)</SelectItem>
                  <SelectItem value="NGN">NGN (₦)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* AI Assistant Settings Card */}
        <Card className="lg:col-span-1">
          <CardHeader className="flex flex-row items-center gap-4">
            <MaDIcon className="w-6 h-6 text-primary" />
            <div>
              <CardTitle className="font-futuristic text-xl tracking-wider">
                Ma-D AI
              </CardTitle>
              <CardDescription>Customize the AI assistant.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
              <div className="space-y-0.5">
                <Label>Enable Assistant</Label>
              </div>
              <Switch 
                checked={settings.enableAssistant}
                onCheckedChange={(checked) => handleInputChange('enableAssistant', checked)}
              />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
              <div className="space-y-0.5">
                <Label>Auto Suggestions</Label>
              </div>
              <Switch 
                checked={settings.autoSuggestions}
                onCheckedChange={(checked) => handleInputChange('autoSuggestions', checked)}
              />
            </div>
          </CardContent>
        </Card>

         {/* Appearance Card */}
        <Card className="lg:col-span-1">
          <CardHeader className="flex flex-row items-center gap-4">
            <Languages className="h-6 w-6" />
            <div>
              <CardTitle className="font-headline">Appearance</CardTitle>
              <CardDescription>Adjust look and feel.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
               <div className="space-y-0.5">
                <Label>Theme</Label>
              </div>
              <ThemeToggle />
            </div>
             <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
               <div className="space-y-0.5">
                <Label>Language</Label>
              </div>
              <Select 
                value={settings.language}
                onValueChange={(value) => handleInputChange('language', value)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="en-lr">Liberian English</SelectItem>
                  <SelectItem value="fr">French</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

       {/* Security Card */}
        <Card>
            <CardHeader className="flex flex-row items-center gap-4">
                <Lock className="h-6 w-6" />
                <div>
                <CardTitle className="font-headline">Security</CardTitle>
                <CardDescription>Manage your application password.</CardDescription>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <Input 
                        id="new-password"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter new password (min. 4 characters)"
                    />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                    <Input 
                        id="confirm-password"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm new password"
                    />
                </div>
                <div className="flex justify-end">
                    <Button onClick={handlePasswordChange} disabled={!newPassword || !confirmPassword}>
                        <Save className="mr-2 h-4 w-4" />
                        Update Password
                    </Button>
                </div>
            </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-destructive">
             <CardHeader className="flex flex-row items-center gap-4">
                <AlertTriangle className="h-6 w-6 text-destructive" />
                <div>
                <CardTitle className="font-headline text-destructive">Danger Zone</CardTitle>
                <CardDescription>These actions are irreversible. Please proceed with caution.</CardDescription>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border border-destructive/20 p-4">
                    <div>
                        <h3 className="font-semibold">Recreate Database</h3>
                        <p className="text-sm text-muted-foreground">This will backup your current data and reset the app with mock data. This can be undone.</p>
                    </div>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                           <Button variant="destructive" className="bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive/20">
                                <DatabaseZap className="mr-2 h-4 w-4" />
                                Recreate Database
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This will create a backup of your current data and reset the application. To confirm, please enter your password if one is set.
                            </AlertDialogDescription>
                            </AlertDialogHeader>
                            {isAuthRequired && (
                                <div className="space-y-2 py-2">
                                    <Label htmlFor="delete-password">Password</Label>
                                    <Input 
                                        id="delete-password"
                                        type="password"
                                        value={deleteConfirmationPassword}
                                        onChange={(e) => setDeleteConfirmationPassword(e.target.value)}
                                        placeholder="Enter your password to confirm"
                                    />
                                </div>
                            )}
                            <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                asChild
                            >
                               <Button
                                    variant="destructive"
                                    onClick={handleRecreateDatabase}
                                    disabled={isAuthRequired && !deleteConfirmationPassword}
                                >
                                    Yes, reset everything
                                </Button>
                            </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>

                {backupExists && (
                    <div className="flex items-center justify-between rounded-lg border border-primary/20 p-4 bg-primary/5">
                        <div>
                            <h3 className="font-semibold">Restore Previous Data</h3>
                            <p className="text-sm text-muted-foreground">A backup was found. You can restore your data from before the last reset.</p>
                        </div>
                        <Button onClick={handleRestoreDatabase}>
                            <History className="mr-2 h-4 w-4" />
                            Restore from Backup
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    </div>
  );
}
