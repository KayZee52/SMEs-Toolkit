
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Building, BrainCircuit, Cloud, Languages, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useApp } from "@/contexts/app-context";
import type { Settings } from "@/lib/types";

export default function SettingsPage() {
  const { settings: globalSettings, updateSettings } = useApp();
  const { toast } = useToast();

  // Local state for form edits
  const [settings, setSettings] = useState<Settings>(globalSettings);

  // Sync local state if global state changes (e.g., on initial load or after save)
  useEffect(() => {
    setSettings(globalSettings);
  }, [globalSettings]);

  const handleInputChange = (field: keyof Settings, value: string | boolean) => {
    setSettings(prev => ({ ...prev, [field]: value as any }));
  };

  const handleSave = () => {
    updateSettings(settings);
    // Toast is now handled in the context
  };

  const handleDiscard = () => {
    setSettings(globalSettings); // Revert local changes to match global state
    toast({
      title: "Changes Discarded",
      description: "Your pending changes have been discarded.",
    });
  };
  
  const hasChanges = JSON.stringify(settings) !== JSON.stringify(globalSettings);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-headline text-3xl font-bold tracking-tight">
          Settings
        </h1>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Business Info Card */}
        <Card>
          <CardHeader className="flex flex-row items-center gap-4">
            <Building className="h-6 w-6" />
            <div>
              <CardTitle className="font-headline">Business Info</CardTitle>
              <CardDescription>Manage your business profile and currency.</CardDescription>
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
                onValueChange={(value: "USD" | "LRD" | "NGN") => handleInputChange('currency', value)}
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
        <Card>
          <CardHeader className="flex flex-row items-center gap-4">
            <BrainCircuit className="h-6 w-6" />
            <div>
              <CardTitle className="font-headline">Ma-D</CardTitle>
              <CardDescription>Customize the behavior of the assistant.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
              <div className="space-y-0.5">
                <Label>Enable Assistant</Label>
                <p className="text-sm text-muted-foreground">
                  Turn the AI helper on or off.
                </p>
              </div>
              <Switch 
                checked={settings.enableAssistant}
                onCheckedChange={(checked) => handleInputChange('enableAssistant', checked)}
              />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
              <div className="space-y-0.5">
                <Label>Auto Suggestions</Label>
                <p className="text-sm text-muted-foreground">
                  Let the AI provide smart prompts.
                </p>
              </div>
              <Switch 
                checked={settings.autoSuggestions}
                onCheckedChange={(checked) => handleInputChange('autoSuggestions', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Backup & Sync Card */}
        <Card>
          <CardHeader className="flex flex-row items-center gap-4">
            <Cloud className="h-6 w-6" />
            <div>
              <CardTitle className="font-headline">Backup & Sync</CardTitle>
              <CardDescription>Manage your data backup and synchronization.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="text-sm text-muted-foreground">
                <p>Status: <span className="text-green-500 font-medium">Online</span></p>
                <p>Last Sync: Today, 2:15 PM</p>
            </div>
            <Button className="w-full">
              <Cloud className="mr-2 h-4 w-4" />
              Sync Manually
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              Automatic daily backups are enabled.
            </p>
          </CardContent>
        </Card>
        
        {/* Language & Accessibility Card */}
        <Card>
          <CardHeader className="flex flex-row items-center gap-4">
            <Languages className="h-6 w-6" />
            <div>
              <CardTitle className="font-headline">Appearance</CardTitle>
              <CardDescription>Adjust the app's look and feel.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
               <div className="space-y-0.5">
                <Label>Theme</Label>
                 <p className="text-sm text-muted-foreground">
                  Choose between light, dark, or system theme.
                </p>
              </div>
              <ThemeToggle />
            </div>
             <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
               <div className="space-y-0.5">
                <Label>Language</Label>
                 <p className="text-sm text-muted-foreground">
                  Select your preferred language.
                </p>
              </div>
              <Select 
                value={settings.language}
                onValueChange={(value: "en" | "en-lr" | "fr") => handleInputChange('language', value)}
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

      {/* Save Changes Footer */}
      <div className="mt-4 flex justify-end gap-2">
        <Button variant="outline" onClick={handleDiscard} disabled={!hasChanges}>
          Discard
        </Button>
        <Button onClick={handleSave} disabled={!hasChanges}>
          <Save className="mr-2 h-4 w-4" />
          Save Changes
        </Button>
      </div>
    </div>
  );
}
