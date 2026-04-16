export default function IncomeLoading() {
  return (
    <div className="animate-pulse">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <div className="h-8 w-28 bg-muted rounded" />
          <div className="h-4 w-36 bg-muted rounded mt-2" />
        </div>
        <div className="flex gap-2">
          <div className="h-9 w-28 bg-muted rounded" />
          <div className="h-9 w-28 bg-muted rounded" />
        </div>
      </div>
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-9 w-28 bg-muted rounded" />
          ))}
        </div>
        <div className="rounded-lg border">
          <div className="h-10 bg-muted/50 rounded-t-lg" />
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-12 border-t bg-muted/20" />
          ))}
        </div>
      </div>
    </div>
  );
}
