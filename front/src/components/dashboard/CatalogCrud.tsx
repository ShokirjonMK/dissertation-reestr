/**
 * CatalogCrud — Umumiy ko'p tilli katalog CRUD komponenti
 *
 * Foydalanish:
 *   <CatalogCrud
 *     title="Mamlakatlar"
 *     columns={[...]}
 *     data={countries}
 *     onAdd={handleAdd}
 *     onEdit={handleEdit}
 *     onDelete={handleDelete}
 *     renderForm={renderForm}
 *   />
 */
"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useI18n } from "@/lib/i18n";

export type CatalogColumn<T> = {
  key: keyof T | string;
  label: string;
  render?: (row: T) => React.ReactNode;
  className?: string;
};

type CatalogCrudProps<T extends { id: number }> = {
  title: string;
  addLabel: string;
  columns: CatalogColumn<T>[];
  data: T[];
  loading?: boolean;
  onAdd: (values: Omit<T, "id" | "created_at" | "updated_at">) => Promise<unknown>;
  onEdit: (id: number, values: Omit<T, "id" | "created_at" | "updated_at">) => Promise<unknown>;
  onDelete: (id: number) => Promise<unknown>;
  renderForm: (
    values: Partial<T>,
    onChange: (key: keyof T, value: unknown) => void
  ) => React.ReactNode;
  initialValues: Omit<T, "id" | "created_at" | "updated_at">;
  searchFields?: (keyof T)[];
};

export function CatalogCrud<T extends { id: number; [key: string]: unknown }>({
  title,
  addLabel,
  columns,
  data,
  loading,
  onAdd,
  onEdit,
  onDelete,
  renderForm,
  initialValues,
  searchFields = [],
}: CatalogCrudProps<T>) {
  const { t } = useI18n();
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [editItem, setEditItem] = useState<T | null>(null);
  const [formValues, setFormValues] = useState<Partial<T>>(initialValues as Partial<T>);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const filtered = data.filter((row) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return searchFields.some((field) => {
      const val = row[field];
      return typeof val === "string" && val.toLowerCase().includes(q);
    });
  });

  const handleOpenAdd = () => {
    setEditItem(null);
    setFormValues(initialValues as Partial<T>);
    setDialogOpen(true);
  };

  const handleOpenEdit = (item: T) => {
    setEditItem(item);
    setFormValues(item);
    setDialogOpen(true);
  };

  const handleFormChange = (key: keyof T, value: unknown) => {
    setFormValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editItem) {
        await onEdit(editItem.id, formValues as Omit<T, "id" | "created_at" | "updated_at">);
      } else {
        await onAdd(formValues as Omit<T, "id" | "created_at" | "updated_at">);
      }
      setDialogOpen(false);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    setDeleting(true);
    try {
      await onDelete(id);
      setDeleteId(null);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Card className="border-border/60 bg-white/70 shadow-sm backdrop-blur dark:bg-slate-900/60">
      <CardHeader className="pb-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-lg font-medium tracking-tight">{title}</CardTitle>
          <div className="flex gap-2">
            {/* Qidiruv */}
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t("common.search")}
                className="h-8 pl-8 text-sm w-40 sm:w-52"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
            <Button size="sm" onClick={handleOpenAdd} className="h-8 gap-1 text-xs">
              <Plus className="h-3.5 w-3.5" />
              {addLabel}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {loading ? (
          <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
            {t("common.loading")}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
            {t("common.noData")}
          </div>
        ) : (
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/60 bg-muted/30">
                  <th className="px-4 py-2.5 text-left font-medium text-muted-foreground text-xs">#</th>
                  {columns.map((col) => (
                    <th
                      key={String(col.key)}
                      className={`px-4 py-2.5 text-left font-medium text-muted-foreground text-xs ${col.className ?? ""}`}
                    >
                      {col.label}
                    </th>
                  ))}
                  <th className="px-4 py-2.5 text-right font-medium text-muted-foreground text-xs">
                    {t("common.actions")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row, idx) => (
                  <tr
                    key={row.id}
                    className="border-b border-border/40 transition-colors hover:bg-muted/20 last:border-0"
                  >
                    <td className="px-4 py-2.5 text-muted-foreground text-xs">{idx + 1}</td>
                    {columns.map((col) => (
                      <td key={String(col.key)} className={`px-4 py-2.5 ${col.className ?? ""}`}>
                        {col.render
                          ? col.render(row)
                          : String(row[col.key as keyof T] ?? "—")}
                      </td>
                    ))}
                    <td className="px-4 py-2.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => handleOpenEdit(row)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive hover:text-destructive"
                          onClick={() => setDeleteId(row.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Jami */}
        {!loading && data.length > 0 && (
          <div className="border-t border-border/40 px-4 py-2 text-xs text-muted-foreground">
            {t("common.total")}: {data.length} ta | Ko&apos;rsatilmoqda: {filtered.length} ta
          </div>
        )}
      </CardContent>

      {/* Qo'shish / tahrirlash dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-base font-medium">
              {editItem ? t("common.edit") : addLabel}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            {renderForm(formValues, handleFormChange)}
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" onClick={() => setDialogOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button size="sm" onClick={handleSave} disabled={saving}>
              {saving ? t("common.loading") : t("common.save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* O'chirish tasdiqlash dialog */}
      <Dialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base font-medium">{t("common.deleteConfirm")}</DialogTitle>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" onClick={() => setDeleteId(null)}>
              {t("common.no")}
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => deleteId !== null && handleDelete(deleteId)}
              disabled={deleting}
            >
              {deleting ? t("common.loading") : t("common.yes")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
