/**
 * Ilmiy yo'nalishlar katalogi sahifasi
 */
import Head from "next/head";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import DashboardLayout from "@/layouts/DashboardLayout";
import { CatalogCrud } from "@/components/dashboard/CatalogCrud";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useI18n } from "@/lib/i18n";
import * as api from "@/services/api";
import type { ScientificDirection, ScientificDirectionPayload } from "@/types";

const INITIAL: ScientificDirectionPayload = {
  name_uz: "",
  name_ru: "",
  name_en: "",
  code: "",
  description: "",
};

export default function DirectionsPage() {
  const { t } = useI18n();
  const qc = useQueryClient();

  const { data: directions = [], isLoading } = useQuery({
    queryKey: ["scientific-directions"],
    queryFn: api.fetchScientificDirections,
  });

  const addMut = useMutation({
    mutationFn: api.createScientificDirection,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["scientific-directions"] }); toast.success(t("common.success")); },
    onError: (e: Error) => toast.error(e.message),
  });

  const editMut = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: ScientificDirectionPayload }) =>
      api.updateScientificDirection(id, payload),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["scientific-directions"] }); toast.success(t("common.success")); },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMut = useMutation({
    mutationFn: api.deleteScientificDirection,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["scientific-directions"] }); toast.success(t("common.success")); },
    onError: (e: Error) => toast.error(e.message),
  });

  const columns = [
    { key: "code" as keyof ScientificDirection, label: t("common.code"), className: "w-24 font-mono text-xs" },
    { key: "name_uz" as keyof ScientificDirection, label: t("common.nameUz") },
    { key: "name_ru" as keyof ScientificDirection, label: t("common.nameRu"), className: "hidden md:table-cell" },
    {
      key: "description" as keyof ScientificDirection,
      label: t("common.description"),
      className: "hidden lg:table-cell max-w-xs",
      render: (row: ScientificDirection) => (
        <span className="line-clamp-1 text-muted-foreground text-xs">{row.description || "—"}</span>
      ),
    },
  ];

  const renderForm = (
    values: Partial<ScientificDirection>,
    onChange: (key: keyof ScientificDirection, value: unknown) => void
  ) => (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label className="text-xs">{t("common.code")}</Label>
          <Input
            value={String(values.code ?? "")}
            onChange={(e) => onChange("code", e.target.value)}
            placeholder="KH-01"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">{t("common.nameUz")} *</Label>
          <Input
            value={String(values.name_uz ?? "")}
            onChange={(e) => onChange("name_uz", e.target.value)}
            placeholder="Konstitutsion huquq"
          />
        </div>
      </div>
      <div className="space-y-1">
        <Label className="text-xs">{t("common.nameRu")}</Label>
        <Input
          value={String(values.name_ru ?? "")}
          onChange={(e) => onChange("name_ru", e.target.value)}
          placeholder="Конституционное право"
        />
      </div>
      <div className="space-y-1">
        <Label className="text-xs">{t("common.nameEn")}</Label>
        <Input
          value={String(values.name_en ?? "")}
          onChange={(e) => onChange("name_en", e.target.value)}
          placeholder="Constitutional Law"
        />
      </div>
      <div className="space-y-1">
        <Label className="text-xs">{t("common.description")}</Label>
        <Textarea
          value={String(values.description ?? "")}
          onChange={(e) => onChange("description", e.target.value)}
          placeholder="Yo'nalish tavsifi..."
          rows={2}
          className="resize-none text-sm"
        />
      </div>
    </div>
  );

  return (
    <>
      <Head>
        <title>{t("catalog.directions")} — Registry</title>
      </Head>
      <DashboardLayout>
        <div className="space-y-4 p-4 md:p-6">
          <h1 className="text-xl font-medium tracking-tight">{t("catalog.directions")}</h1>
          <CatalogCrud<ScientificDirection>
            title={t("catalog.directions")}
            addLabel={t("catalog.addDirection")}
            columns={columns}
            data={directions}
            loading={isLoading}
            onAdd={(v) => void addMut.mutateAsync(v as ScientificDirectionPayload)}
            onEdit={(id, v) => void editMut.mutateAsync({ id, payload: v as ScientificDirectionPayload })}
            onDelete={(id) => void deleteMut.mutateAsync(id)}
            renderForm={renderForm}
            initialValues={INITIAL}
            searchFields={["name_uz", "name_ru", "name_en", "code"]}
          />
        </div>
      </DashboardLayout>
    </>
  );
}
