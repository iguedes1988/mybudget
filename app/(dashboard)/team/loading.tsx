import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function TeamLoading() {
  return (
    <div className="animate-pulse">
      <div className="mb-6">
        <div className="h-8 w-40 bg-muted rounded" />
        <div className="h-4 w-52 bg-muted rounded mt-2" />
      </div>
      <div className="space-y-6 max-w-3xl">
        <Card>
          <CardHeader>
            <div className="h-5 w-32 bg-muted rounded" />
          </CardHeader>
          <CardContent>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-14 bg-muted/30 rounded-lg mb-3" />
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
