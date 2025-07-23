import { Table } from "@/components/ui/table";

export function DataTable<T extends object>({ data }: { data: T[] }) {
  if (!data || !data.length) return <div className="text-muted-foreground">No data available.</div>;
  const columns = Object.keys(data[0]);
  return (
    <div className="overflow-x-auto rounded-xl bg-card shadow">
      <Table>
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col} className="px-4 py-2 text-left font-semibold text-sm text-muted-foreground">{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i} className="border-t">
              {columns.map((col) => (
                <td key={col} className="px-4 py-2 text-sm">{String((row as Record<string, unknown>)[col])}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
} 