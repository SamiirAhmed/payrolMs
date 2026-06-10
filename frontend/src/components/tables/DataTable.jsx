import { useMemo, useState } from "react";
import { FiArrowDown, FiArrowUp } from "react-icons/fi";
import Badge from "../common/Badge";
import Pagination from "../common/Pagination";
import { paginate, sortBy } from "../../utils/helpers";

export default function DataTable({
  columns,
  rows,
  pageSize = 8,
  emptyTitle = "No data found",
  emptyDescription = "Try adjusting your filters or creating a new record."
}) {
  const [sort, setSort] = useState({ key: "", direction: "asc" });
  const [page, setPage] = useState(1);

  const sortedRows = useMemo(() => sortBy(rows, sort.key, sort.direction), [rows, sort]);
  const pagedRows = useMemo(() => paginate(sortedRows, page, pageSize), [sortedRows, page, pageSize]);
  const totalPages = Math.max(1, Math.ceil(sortedRows.length / pageSize));

  const toggleSort = (key) => {
    setSort((current) =>
      current.key === key
        ? { key, direction: current.direction === "asc" ? "desc" : "asc" }
        : { key, direction: "asc" }
    );
  };

  return (
    <div className="space-y-4">
      {pagedRows.length ? (
        <div className="overflow-hidden rounded-3xl border border-slate-200">
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead className="bg-slate-50">
                <tr>
                  {columns.map((column) => (
                    <th key={column.key} className="px-2.5 py-2.5 text-left text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">
                      <button
                        type="button"
                        className="inline-flex items-center gap-2"
                        onClick={() => column.sortable && toggleSort(column.key)}
                      >
                        {column.label}
                        {sort.key === column.key ? (
                          sort.direction === "asc" ? <FiArrowUp /> : <FiArrowDown />
                        ) : null}
                      </button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pagedRows.map((row) => (
                  <tr key={row.id} className="border-t border-slate-100 text-sm text-slate-700 transition hover:bg-slate-50">
                    {columns.map((column) => (
                      <td key={column.key} className="px-2.5 py-2.5 align-top">
                        {column.render
                          ? column.render(row[column.key], row)
                          : column.type === "badge"
                            ? <Badge>{row[column.key]}</Badge>
                            : row[column.key]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="rounded-3xl border border-slate-200 bg-white px-6 py-12 text-center">
          <h4 className="text-lg font-bold text-slate-900">{emptyTitle}</h4>
          <p className="mt-2 text-sm text-slate-500">{emptyDescription}</p>
        </div>
      )}
      {pagedRows.length ? <Pagination page={page} totalPages={totalPages} onPageChange={setPage} /> : null}
    </div>
  );
}
