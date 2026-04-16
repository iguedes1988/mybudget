import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function ReportsLoading() {
  return (
    <div className="animate-pulse">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <div className="h-8 w-28 bg-muted rounded" />
          <div className="h-4 w-56 bg-muted rounded mt-2" />
        </div>
        <div className="flex gap-2">
          <div className="h-9 w-24 bg-muted rounded" />
        </div>
      </div>
      <div className="space-y-6">
        <Card>
          <CardHeader><div className="h-5 w-48 bg-muted rounded" /></CardHeader>
          <CardContent><div className="h-64 bg-muted rounded" /></CardContent>
        </Card>
        <Card>
          <CardHeader><div className="h-5 w-48 bg-muted rounded" /></CardHeader>
          <CardContent><div className="h-96 bg-muted rounded" /></CardContent>
        </Card>
      </div>
    </div>
  );
}
