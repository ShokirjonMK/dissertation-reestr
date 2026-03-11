/**
 * Tumanlar katalogi sahifasi
 */
import Head from "next/head";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import DashboardLayout from "@/layouts/DashboardLayout";
import { CatalogCrud } from "@/components/dashboard/CatalogCrud";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useI18n } from "@/lib/i18n";
import * as api from "@/services/api";
import type { District, DistrictPayload, Region } from "@/types";

const INITIAL: DistrictPayload = { name_uz: "", name_ru: "", name_en: "", region_id: 0 };

export default function DistrictsPage() {
  const { t, lang } = useI18n();
  const qc = useQueryClient();

  const { data: districts = [], isLoading } = useQuery({
    queryKey: ["districts"],
    queryFn: api.fetchDistricts,
  });
  const { data: regions = [] } = useQuery({
    queryKey: ["regions"],
    queryFn: api.fetchRegions,
  });

  const getRegionName = (id?: number | null) => {
    const r = regions.find((x) => x.id === id);
    if (!r) return "—";
    return (r as Region)[`name_${lang}` as keyof Region] as string || r.name_uz;
  };

  const addMut = useMutation({
    mutationFn: api.createDistrict,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["districts"] }); toast.success(t("common.success")); },
    onError: (e: Error) => toast.error(e.message),
  });
  const editMut = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: DistrictPayload }) =>
      api.updateDistrict(id, payload),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["districts"] }); toast.success(t("common.success")); },
    onError: (e: Error) => toast.error(e.message),
  });
  const deleteMut = useMutation({
    mutationFn: api.deleteDistrict,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["districts"] }); toast.success(t("common.success")); },
    onError: (e: Error) => toast.error(e.message),
  });

  const columns = [
    { key: "name_uz" as keyof District, label: t("common.nameUz") },
    { key: "name_ru" as keyof District, label: t("common.nameRu"), className: "hidden md:table-cell" },
    {
      key: "region_id" as keyof District,
      label: t("catalog.region"),
      render: (row: District) => (
        <span className="text-xs text-muted-foreground">{getRegionName(row.region_id)}</span>
      ),
    },
  ];

  const renderForm = (
    values: Partial<District>,
    onChange: (key: keyof District, value: unknown) => void
  ) => (
    <div className="space-y-3">
      <div className="space-y-1">
        <Label className="text-xs">{t("catalog.region")} *</Label>
        <Select
          value={values.region_id ? String(values.region_id) : ""}
          onValueChange={(v) => onChange("region_id", Number(v))}
        >
          <SelectTrigger className="h-8 text-sm">
            <SelectValue placeholder="Region tanlang..." />
          </SelectTrigger>
          <SelectContent>
            {regions.map((r) => (
              <SelectItem key={r.id} value={String(r.id)}>
                {(r as Region)[`name_${lang}` as keyof Region] as string || r.name_uz}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1">
        <Label className="text-xs">{t("common.nameUz")} *</Label>
        <Input
          value={String(values.name_uz ?? "")}
          onChange={(e) => onChange("name_uz", e.target.value)}
          placeholder="Yunusobod tumani"
        />
      </div>
      <div className="space-y-1">
        <Label className="text-xs">{t("common.nameRu")}</Label>
        <Input
          value={String(values.name_ru ?? "")}
          onChange={(e) => onChange("name_ru", e.target.value)}
          placeholder="Юнусабадский район"
        />
      </div>
      <div className="space-y-1">
        <Label className="text-xs">{t("common.nameEn")}</Label>
        <Input
          value={String(values.name_en ?? "")}
          onChange={(e) => onChange("name_en", e.target.value)}
          placeholder="Yunusabad district"
        />
      </div>
    </div>
  );

  return (
    <>
      <Head>
        <title>{t("catalog.districts")} — Registry</title>
      </Head>
      <DashboardLayout>
        <div className="space-y-4 p-4 md:p-6">
          <h1 className="text-xl font-medium tracking-tight">{t("catalog.districts")}</h1>
          <CatalogCrud<District>
            title={t("catalog.districts")}
            addLabel="Tuman qo'shish"
            columns={columns}
            data={districts}
            loading={isLoading}
            onAdd={(v) => addMut.mutateAsync(v as DistrictPayload)}
            onEdit={(id, v) => editMut.mutateAsync({ id, payload: v as DistrictPayload })}
            onDelete={(id) => deleteMut.mutateAsync(id)}
            renderForm={renderForm}
            initialValues={INITIAL}
            searchFields={["name_uz", "name_ru", "name_en"]}
          />
        </div>
      </DashboardLayout>
    </>
  );
}
