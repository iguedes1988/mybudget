import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function AdminTeamsLoading() {
  return (
    <div className="animate-pulse">
      <div className="mb-6">
        <div className="h-8 w-48 bg-muted rounded" />
        <div className="h-4 w-56 bg-muted rounded mt-2" />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <div className="h-5 w-32 bg-muted rounded" />
            </CardHeader>
            <CardContent>
              <div className="h-24 bg-muted/30 rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
