
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Building, BrainCircuit, Cloud, Languages, Save, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useApp } from "@/contexts/app-context";
import type { Settings } from "@/lib/types";
import { MaDIcon } from "@/components/ui/icons";

export default function SettingsPage() {
  const { settings: globalSettings, updateSettings, setPassword } = useApp();
  const { toast } = useToast();

  const [settings, setSettings] = useState<Settings>(globalSettings);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

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
    </div>
  );
}
