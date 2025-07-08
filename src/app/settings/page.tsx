
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-headline text-3xl font-bold tracking-tight">
          Settings
        </h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Coming Soon</CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            This section will allow you to configure business details, app
            preferences, and sync settings.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
