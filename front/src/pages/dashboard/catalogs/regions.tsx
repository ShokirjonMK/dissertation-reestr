/**
 * Regionlar katalogi sahifasi
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
import type { Region, RegionPayload, Country } from "@/types";

const INITIAL: RegionPayload = { name_uz: "", name_ru: "", name_en: "", country_id: null };

export default function RegionsPage() {
  const { t, lang } = useI18n();
  const qc = useQueryClient();

  const { data: regions = [], isLoading } = useQuery({
    queryKey: ["regions"],
    queryFn: api.fetchRegions,
  });
  const { data: countries = [] } = useQuery({
    queryKey: ["countries"],
    queryFn: api.fetchCountries,
  });

  const getCountryName = (id?: number | null) => {
    const c = countries.find((x) => x.id === id);
    if (!c) return "—";
    return (c as Country)[`name_${lang}` as keyof Country] as string || c.name_uz;
  };

  const addMut = useMutation({
    mutationFn: api.createRegion,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["regions"] }); toast.success(t("common.success")); },
    onError: (e: Error) => toast.error(e.message),
  });
  const editMut = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: RegionPayload }) =>
      api.updateRegion(id, payload),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["regions"] }); toast.success(t("common.success")); },
    onError: (e: Error) => toast.error(e.message),
  });
  const deleteMut = useMutation({
    mutationFn: api.deleteRegion,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["regions"] }); toast.success(t("common.success")); },
    onError: (e: Error) => toast.error(e.message),
  });

  const columns = [
    { key: "name_uz" as keyof Region, label: t("common.nameUz") },
    { key: "name_ru" as keyof Region, label: t("common.nameRu"), className: "hidden md:table-cell" },
    {
      key: "country_id" as keyof Region,
      label: t("catalog.country"),
      className: "hidden sm:table-cell",
      render: (row: Region) => (
        <span className="text-xs text-muted-foreground">{getCountryName(row.country_id)}</span>
      ),
    },
  ];

  const renderForm = (
    values: Partial<Region>,
    onChange: (key: keyof Region, value: unknown) => void
  ) => (
    <div className="space-y-3">
      <div className="space-y-1">
        <Label className="text-xs">{t("common.nameUz")} *</Label>
        <Input
          value={String(values.name_uz ?? "")}
          onChange={(e) => onChange("name_uz", e.target.value)}
          placeholder="Toshkent shahri"
        />
      </div>
      <div className="space-y-1">
        <Label className="text-xs">{t("common.nameRu")}</Label>
        <Input
          value={String(values.name_ru ?? "")}
          onChange={(e) => onChange("name_ru", e.target.value)}
          placeholder="город Ташкент"
        />
      </div>
      <div className="space-y-1">
        <Label className="text-xs">{t("common.nameEn")}</Label>
        <Input
          value={String(values.name_en ?? "")}
          onChange={(e) => onChange("name_en", e.target.value)}
          placeholder="Tashkent city"
        />
      </div>
      <div className="space-y-1">
        <Label className="text-xs">{t("catalog.country")}</Label>
        <Select
          value={values.country_id ? String(values.country_id) : ""}
          onValueChange={(v) => onChange("country_id", v ? Number(v) : null)}
        >
          <SelectTrigger className="h-8 text-sm">
            <SelectValue placeholder="Tanlang..." />
          </SelectTrigger>
          <SelectContent>
            {countries.map((c) => (
              <SelectItem key={c.id} value={String(c.id)}>
                {(c as Country)[`name_${lang}` as keyof Country] as string || c.name_uz}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  return (
    <>
      <Head>
        <title>{t("catalog.regions")} — Registry</title>
      </Head>
      <DashboardLayout>
        <div className="space-y-4 p-4 md:p-6">
          <h1 className="text-xl font-medium tracking-tight">{t("catalog.regions")}</h1>
          <CatalogCrud<Region>
            title={t("catalog.regions")}
            addLabel={t("catalog.addRegion")}
            columns={columns}
            data={regions}
            loading={isLoading}
            onAdd={(v) => void addMut.mutateAsync(v as RegionPayload)}
            onEdit={(id, v) => void editMut.mutateAsync({ id, payload: v as RegionPayload })}
            onDelete={(id) => void deleteMut.mutateAsync(id)}
            renderForm={renderForm}
            initialValues={INITIAL}
            searchFields={["name_uz", "name_ru", "name_en"]}
          />
        </div>
      </DashboardLayout>
    </>
  );
}
