import { useMemo, useState } from "react";

import type { Dissertation } from "@/services/api";

type Props = {
  items: Dissertation[];
};

const PAGE_SIZE = 10;

export default function DissertationTable({ items }: Props) {
  const [sortField, setSortField] = useState<keyof Dissertation>("id");
  const [sortAsc, setSortAsc] = useState(false);
  const [page, setPage] = useState(1);

  const sorted = useMemo(() => {
    const copy = [...items];
    copy.sort((a, b) => {
      const av = String(a[sortField] ?? "");
      const bv = String(b[sortField] ?? "");
      if (sortAsc) {
        return av.localeCompare(bv, undefined, { numeric: true });
      }
      return bv.localeCompare(av, undefined, { numeric: true });
    });
    return copy;
  }, [items, sortAsc, sortField]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paged = sorted.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const setSort = (field: keyof Dissertation) => {
    if (field === sortField) {
      setSortAsc((prev) => !prev);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  return (
    <div className="card">
      <table className="table">
        <thead>
          <tr>
            <th onClick={() => setSort("id")}>ID</th>
            <th onClick={() => setSort("title")}>Title</th>
            <th onClick={() => setSort("status")}>Status</th>
            <th onClick={() => setSort("defense_date")}>Defense Date</th>
            <th onClick={() => setSort("author_id")}>Author</th>
          </tr>
        </thead>
        <tbody>
          {paged.map((item) => (
            <tr key={item.id}>
              <td>{item.id}</td>
              <td>{item.title}</td>
              <td>
                <span className={`status-chip ${item.status}`}>{item.status}</span>
              </td>
              <td>{item.defense_date || "-"}</td>
              <td>{item.author_id}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="table-pager">
        <button className="btn" onClick={() => setPage((p) => Math.max(1, p - 1))}>
          Prev
        </button>
        <span>
          {safePage} / {totalPages}
        </span>
        <button className="btn" onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
          Next
        </button>
      </div>
    </div>
  );
}
