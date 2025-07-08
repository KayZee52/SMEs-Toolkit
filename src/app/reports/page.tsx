
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ReportsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-headline text-3xl font-bold tracking-tight">
          Reports & Analytics
        </h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Coming Soon</CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            This section will provide detailed reports on sales, profits, and
            product performance.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
