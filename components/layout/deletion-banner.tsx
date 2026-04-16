"use client";

import { useTransition } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cancelAccountDeletion } from "@/actions/account";

interface DeletionBannerProps {
  scheduledAt: Date;
}

export function DeletionBanner({ scheduledAt }: DeletionBannerProps) {
  const [isPending, startTransition] = useTransition();

  function handleCancel() {
    startTransition(async () => {
      await cancelAccountDeletion();
    });
  }

  const dateStr = new Date(scheduledAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2 text-sm">
          <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
          <span>
            Your account is scheduled for deletion on {dateStr}. All data will be permanently removed.
          </span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleCancel}
          disabled={isPending}
          className="shrink-0"
        >
          {isPending ? "Cancelling..." : "Cancel Deletion"}
        </Button>
      </div>
    </div>
  );
}
