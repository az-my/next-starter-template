import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, RefreshCw } from "lucide-react";
import { flexRender } from "@tanstack/react-table";
import { useIncidentTable, statusOptions, syncOptions } from "../hooks/useIncidentTable";
import { IncidentSerpo } from "@/types/incident-serpo";
import { Badge } from "@/components/ui/badge";

// Interface and re-export
interface IncidentSerpoListProps {
  incidents: IncidentSerpo[];
  onSync: (incident: IncidentSerpo) => void;
  syncingId?: string | null;
  onRefresh?: () => void;
}
export type { IncidentSerpo } from "@/types/incident-serpo";


// A separate, memoized component for the details dialog
const IncidentDetailsDialog = ({ incident, onClose }: { incident: IncidentSerpo | null; onClose: () => void }) => {
    if (!incident) return null;
    
    const formatDate = (date: string | null) => date ? new Intl.DateTimeFormat("en-GB", { dateStyle: 'long', timeStyle: 'short' }).format(new Date(date)) : 'N/A';

    return (
        <Dialog open={!!incident} onOpenChange={(isOpen) => !isOpen && onClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Incident: {incident.id_incident}</DialogTitle>
                    <DialogDescription>Complete information about the incident.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-3 py-4 text-sm [&>div]:grid [&>div]:grid-cols-[110px_1fr] [&>div]:items-start">
                    <div><span className="font-medium text-muted-foreground">Status</span><Badge>{incident.status}</Badge></div>
                    <div><span className="font-medium text-muted-foreground">Zone</span><span>{incident.crossing_zona}</span></div>
                    <div><span className="font-medium text-muted-foreground">Started</span><span>{formatDate(incident.started_at)}</span></div>
                    <div><span className="font-medium text-muted-foreground">Ended</span><span>{formatDate(incident.stopped_at)}</span></div>
                    <div><span className="font-medium text-muted-foreground">Duration</span><span>{incident.duration || "N/A"}</span></div>
                    <div><span className="font-medium text-muted-foreground">Description</span><span className="break-words">{incident.description || "None"}</span></div>
                </div>
            </DialogContent>
        </Dialog>
    );
};


export function IncidentSerpoList({ incidents, onSync, syncingId, onRefresh }: IncidentSerpoListProps) {
  const [incidentToView, setIncidentToView] = useState<IncidentSerpo | null>(null);

  const { table, globalFilter, setGlobalFilter } = useIncidentTable({
    data: incidents,
    onSync,
    syncingId,
    onViewDetails: setIncidentToView, // Simply pass the setter function
  });

  const handleFilterChange = useCallback((columnId: string, value: string) => {
    table.getColumn(columnId)?.setFilterValue(value === 'all' ? null : value);
  }, [table]);

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Incident List</CardTitle>
              <CardDescription>
                Showing {table.getFilteredRowModel().rows.length} of {incidents.length} incidents.
              </CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <div className="relative w-full sm:w-auto">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search incidents..."
                  value={globalFilter}
                  onChange={(e) => setGlobalFilter(e.target.value)}
                  className="pl-8 w-full sm:w-[250px]"
                />
              </div>
              <Select onValueChange={(value) => handleFilterChange('status', value)}>
                <SelectTrigger className="w-full sm:w-[150px]"><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>{statusOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
              </Select>
              <Select onValueChange={(value) => handleFilterChange('is_synced_to_sheet', value)}>
                <SelectTrigger className="w-full sm:w-[150px]"><SelectValue placeholder="Sync" /></SelectTrigger>
                <SelectContent>{syncOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
              </Select>
              {onRefresh && <Button variant="outline" size="icon" onClick={onRefresh}><RefreshCw className="h-4 w-4" /></Button>}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map(headerGroup => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map(header => (
                      <TableHead key={header.id}>
                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows.length > 0 ? (
                  table.getRowModel().rows.map(row => (
                    <TableRow key={row.id}>
                      {row.getVisibleCells().map(cell => (
                        <TableCell key={cell.id}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={table.getAllColumns().length} className="h-24 text-center">
                      No results found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <div className="flex items-center justify-end space-x-2 py-4">
            <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>Previous</Button>
            <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>Next</Button>
          </div>
        </CardContent>
      </Card>

      <IncidentDetailsDialog 
        incident={incidentToView}
        onClose={() => setIncidentToView(null)}
      />
    </>
  );
}