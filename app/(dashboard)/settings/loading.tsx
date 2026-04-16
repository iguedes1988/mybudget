import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function SettingsLoading() {
  return (
    <div className="animate-pulse">
      <div className="flex items-center justify-between mb-6 lg:mb-8">
        <div>
          <div className="h-8 w-32 bg-muted rounded" />
          <div className="h-4 w-56 bg-muted rounded mt-2" />
        </div>
      </div>
      <div className="space-y-6 max-w-2xl">
        <Card>
          <CardHeader>
            <div className="h-5 w-28 bg-muted rounded" />
            <div className="h-4 w-44 bg-muted rounded mt-1" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="h-16 bg-muted/30 rounded-lg" />
          </CardContent>
        </Card>
        <div className="space-y-1 pt-2">
          <div className="h-5 w-20 bg-muted rounded" />
          <div className="h-4 w-52 bg-muted rounded mt-1" />
        </div>
        <Card>
          <CardHeader><div className="h-5 w-28 bg-muted rounded" /></CardHeader>
          <CardContent><div className="h-20 bg-muted/30 rounded" /></CardContent>
        </Card>
        <Card>
          <CardHeader><div className="h-5 w-36 bg-muted rounded" /></CardHeader>
          <CardContent><div className="h-20 bg-muted/30 rounded" /></CardContent>
        </Card>
      </div>
    </div>
  );
}
