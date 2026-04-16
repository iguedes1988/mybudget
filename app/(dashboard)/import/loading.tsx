import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function ImportLoading() {
  return (
    <div className="animate-pulse">
      <div className="mb-6">
        <div className="h-8 w-40 bg-muted rounded" />
        <div className="h-4 w-72 bg-muted rounded mt-2" />
      </div>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="h-5 w-36 bg-muted rounded" />
            <div className="h-4 w-64 bg-muted rounded mt-1" />
          </CardHeader>
          <CardContent>
            <div className="h-40 bg-muted rounded border-2 border-dashed" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <div className="h-5 w-32 bg-muted rounded" />
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <div className="h-9 w-36 bg-muted rounded" />
              <div className="h-9 w-36 bg-muted rounded" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
