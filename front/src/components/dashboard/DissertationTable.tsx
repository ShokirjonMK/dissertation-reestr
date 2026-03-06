import Link from "next/link";
import { useMemo, useState } from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Pagination } from "@/components/ui/pagination";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Dissertation } from "@/types";

type Props = {
  items: Dissertation[];
};

const PAGE_SIZE = 10;

type SortField = "author_name" | "title" | "status" | "scientific_direction_name";

export default function DissertationTable({ items }: Props) {
  const [sortField, setSortField] = useState<SortField>("title");
  const [ascending, setAscending] = useState(true);
  const [page, setPage] = useState(1);

  const sorted = useMemo(() => {
    const list = [...items];
    list.sort((a, b) => {
      const av = String(a[sortField] || "");
      const bv = String(b[sortField] || "");
      const comparison = av.localeCompare(bv, undefined, { sensitivity: "base", numeric: true });
      return ascending ? comparison : -comparison;
    });
    return list;
  }, [ascending, items, sortField]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginated = sorted.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const toggleSort = (field: SortField) => {
    if (field === sortField) {
      setAscending((prev) => !prev);
      return;
    }
    setSortField(field);
    setAscending(true);
  };

  const statusBadge = (status: string) => {
    if (status === "approved") {
      return "success" as const;
    }
    if (status === "rejected") {
      return "destructive" as const;
    }
    if (status === "pending") {
      return "warning" as const;
    }
    return "secondary" as const;
  };

  return (
    <Card className="animate-slide-up p-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="cursor-pointer" onClick={() => toggleSort("author_name")}>
              Applicant
            </TableHead>
            <TableHead className="cursor-pointer" onClick={() => toggleSort("title")}>
              Research Title
            </TableHead>
            <TableHead className="cursor-pointer" onClick={() => toggleSort("status")}>
              Status
            </TableHead>
            <TableHead className="cursor-pointer" onClick={() => toggleSort("scientific_direction_name")}>
              Direction
            </TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginated.map((item) => (
            <TableRow key={item.id} id={String(item.id)}>
              <TableCell>{item.author_name || `User #${item.author_id}`}</TableCell>
              <TableCell>{item.title}</TableCell>
              <TableCell>
                <Badge variant={statusBadge(item.status)}>{item.status}</Badge>
              </TableCell>
              <TableCell>{item.scientific_direction_name || "-"}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" asChild>
                    <Link href={`/dashboard/dissertations/${item.id}`}>View</Link>
                  </Button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="sm" variant="ghost">
                        More
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem asChild>
                        <Link href={`/dashboard/dissertations/${item.id}`}>Open details</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem>Moderate</DropdownMenuItem>
                      <DropdownMenuItem>Export</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Pagination page={currentPage} totalPages={totalPages} onPageChange={setPage} />
    </Card>
  );
}
