import { Badge } from "@/components/ui/badge";

export function SyncingBadge() {
  return (
    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 flex items-center gap-1">
      <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse"></span>
      Syncing...
    </Badge>
  );
}