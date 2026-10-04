function renderValue(value: unknown) {
  if (value === null || value === undefined || value === "") return "—";
  if (Array.isArray(value)) return value.length ? value.map(String).join(", ") : "—";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

export function RecordTable({ rows }: { rows: Record<string, unknown>[] }) {
  if (!rows.length) {
    return <div className="border border-stone-300 bg-white p-4 text-sm text-stone-600">No records yet.</div>;
  }

  const columns = Object.keys(rows[0]).slice(0, 7);

  return (
    <div className="overflow-x-auto border border-stone-300 bg-white">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-stone-100 text-xs uppercase tracking-wide text-stone-600">
          <tr>
            {columns.map((column) => (
              <th key={column} className="whitespace-nowrap px-3 py-2 font-semibold">
                {column.replaceAll("_", " ")}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={String(row.id ?? index)} className="border-t border-stone-200">
              {columns.map((column) => (
                <td key={column} className="max-w-[280px] truncate px-3 py-2">
                  {renderValue(row[column])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
