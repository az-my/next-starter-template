import { useState, useMemo, useCallback, createElement } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  ColumnDef,
  SortingState,
  ColumnFiltersState,
} from "@tanstack/react-table";
import { IncidentSerpo, IncidentStatus } from "@/types/incident-serpo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Info } from "lucide-react";

// Props for the hook
interface UseIncidentTableProps {
  data: IncidentSerpo[];
  onSync: (incident: IncidentSerpo) => void;
  syncingId?: string | null;
  onViewDetails: (incident: IncidentSerpo) => void;
}

// Helper function defined outside the hook for stability
const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return "N/A";
  try {
    return new Intl.DateTimeFormat("en-GB", {
      year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
    }).format(new Date(dateString));
  } catch (error) {
    return "Invalid Date";
  }
};

export const useIncidentTable = ({ data, onSync, syncingId, onViewDetails }: UseIncidentTableProps) => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState('');

  // Memoize columns for performance
  const columns = useMemo<ColumnDef<IncidentSerpo>[]>(() => [
    {
      accessorKey: "id_incident",
      header: "Incident ID",
      cell: ({ row }) => row.getValue("id_incident"),
      enableHiding: false,
      enableSorting: true,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as IncidentStatus;
        const variant: "secondary" | "default" | "destructive" | "outline" = 
          status === IncidentStatus.ACTIVE ? "secondary" :
          status === IncidentStatus.COMPLETED ? "default" :
          status === IncidentStatus.CANCELLED ? "destructive" : "outline";
        return createElement(Badge, { variant, className: "capitalize" }, status.toLowerCase());
      },
      filterFn: (row, id, value) => value.includes(row.getValue(id)),
    },
    {
      accessorKey: "started_at",
      header: "Date",
      cell: ({ row }) => {
        const startedAt = row.original.started_at;
        return formatDate(startedAt).split(',')[0];
      },
    },
    {
      accessorKey: "duration",
      header: "Duration",
      cell: ({ row }) => row.getValue("duration") || "N/A",
    },
    {
      accessorKey: "is_synced_to_sheet",
      header: "Sync Status",
      cell: ({ row }) => {
        const isSynced = row.getValue("is_synced_to_sheet") as boolean;
        return createElement(Badge, { 
          variant: "outline", 
          className: isSynced ? "text-green-600 border-green-600" : "text-amber-600 border-amber-600" 
        }, isSynced ? "Synced" : "Pending");
      },
      filterFn: (row, id, value) => value.includes(String(row.getValue(id))),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const incident = row.original;
        return createElement('div', { className: "flex items-center justify-end gap-2" }, [
          createElement(Button, {
            key: 'view',
            variant: "ghost",
            size: "icon",
            onClick: () => onViewDetails(incident)
          }, createElement(Info, { className: "h-4 w-4" })),
          createElement(Button, {
            key: 'sync',
            size: "sm",
            variant: incident.is_synced_to_sheet ? "outline" : "default",
            onClick: () => onSync(incident),
            disabled: incident.is_synced_to_sheet || syncingId === incident.id,
            className: "w-24"
          }, syncingId === incident.id ? "Syncing..." : incident.is_synced_to_sheet ? "Synced" : "Sync")
        ]);
      },
    },
  ], [onSync, syncingId, onViewDetails]);

  const table = useReactTable({
    data,
    columns,
    state: { sorting, columnFilters, globalFilter },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return { table, globalFilter, setGlobalFilter };
};

// Define static options outside the hook to prevent re-creation
export const statusOptions = [
  { value: "all", label: "All Statuses" },
  { value: IncidentStatus.ACTIVE, label: "Active" },
  { value: IncidentStatus.COMPLETED, label: "Completed" },
  { value: IncidentStatus.CANCELLED, label: "Cancelled" },
];

export const syncOptions = [
  { value: "all", label: "All Sync Statuses" },
  { value: "true", label: "Synced" },
  { value: "false", label: "Pending" },
];