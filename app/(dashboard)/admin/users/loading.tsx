export default function AdminUsersLoading() {
  return (
    <div className="animate-pulse">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="h-8 w-48 bg-muted rounded" />
          <div className="h-4 w-32 bg-muted rounded mt-2" />
        </div>
        <div className="h-9 w-28 bg-muted rounded" />
      </div>
      <div className="rounded-lg border">
        <div className="h-10 bg-muted/50 rounded-t-lg" />
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-14 border-t bg-muted/20" />
        ))}
      </div>
    </div>
  );
}
