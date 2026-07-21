import Link from "next/link";

import { Button } from "@/components/ui/button";
import { SyncMark } from "@/components/shared/sync-mark";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background p-6 text-center">
      <SyncMark className="h-6 w-10" />
      <div className="space-y-1">
        <h1 className="font-display text-lg font-semibold">Page not found</h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          That page doesn&apos;t exist, or it moved.
        </p>
      </div>
      <Button asChild>
        <Link href="/dashboard">Back to dashboard</Link>
      </Button>
    </div>
  );
}
