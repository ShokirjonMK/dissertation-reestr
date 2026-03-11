/**
 * Universitetlar katalogi sahifasi — mamlakat va region bilan
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
import type { University, UniversityPayload, Country, Region } from "@/types";

const INITIAL: UniversityPayload = {
  name_uz: "",
  name_ru: "",
  name_en: "",
  short_name: "",
  country_id: null,
  region_id: null,
};

export default function UniversitiesPage() {
  const { t, lang } = useI18n();
  const qc = useQueryClient();

  const { data: universities = [], isLoading } = useQuery({
    queryKey: ["universities"],
    queryFn: api.fetchUniversities,
  });
  const { data: countries = [] } = useQuery({
    queryKey: ["countries"],
    queryFn: api.fetchCountries,
  });
  const { data: regions = [] } = useQuery({
    queryKey: ["regions"],
    queryFn: api.fetchRegions,
  });

  const getCountryName = (id?: number | null) => {
    const c = countries.find((x) => x.id === id);
    if (!c) return "—";
    return (c as Country)[`name_${lang}` as keyof Country] as string || c.name_uz;
  };
  const getRegionName = (id?: number | null) => {
    const r = regions.find((x) => x.id === id);
    if (!r) return "—";
    return (r as Region)[`name_${lang}` as keyof Region] as string || r.name_uz;
  };

  const addMut = useMutation({
    mutationFn: api.createUniversity,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["universities"] }); toast.success(t("common.success")); },
    onError: (e: Error) => toast.error(e.message),
  });
  const editMut = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UniversityPayload }) =>
      api.updateUniversity(id, payload),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["universities"] }); toast.success(t("common.success")); },
    onError: (e: Error) => toast.error(e.message),
  });
  const deleteMut = useMutation({
    mutationFn: api.deleteUniversity,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["universities"] }); toast.success(t("common.success")); },
    onError: (e: Error) => toast.error(e.message),
  });

  const columns = [
    { key: "short_name" as keyof University, label: t("catalog.shortName"), className: "w-24 font-medium" },
    { key: "name_uz" as keyof University, label: t("common.nameUz") },
    {
      key: "country_id" as keyof University,
      label: t("catalog.country"),
      className: "hidden md:table-cell",
      render: (row: University) => (
        <span className="text-xs text-muted-foreground">{getCountryName(row.country_id)}</span>
      ),
    },
    {
      key: "region_id" as keyof University,
      label: t("catalog.region"),
      className: "hidden lg:table-cell",
      render: (row: University) => (
        <span className="text-xs text-muted-foreground">{getRegionName(row.region_id)}</span>
      ),
    },
  ];

  const renderForm = (
    values: Partial<University>,
    onChange: (key: keyof University, value: unknown) => void
  ) => (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label className="text-xs">{t("catalog.shortName")}</Label>
          <Input
            value={String(values.short_name ?? "")}
            onChange={(e) => onChange("short_name", e.target.value)}
            placeholder="TDYU"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">{t("common.nameUz")} *</Label>
          <Input
            value={String(values.name_uz ?? "")}
            onChange={(e) => onChange("name_uz", e.target.value)}
            placeholder="Toshkent Davlat Yuridik Universiteti"
          />
        </div>
      </div>
      <div className="space-y-1">
        <Label className="text-xs">{t("common.nameRu")}</Label>
        <Input
          value={String(values.name_ru ?? "")}
          onChange={(e) => onChange("name_ru", e.target.value)}
        />
      </div>
      <div className="space-y-1">
        <Label className="text-xs">{t("common.nameEn")}</Label>
        <Input
          value={String(values.name_en ?? "")}
          onChange={(e) => onChange("name_en", e.target.value)}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
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
        <div className="space-y-1">
          <Label className="text-xs">{t("catalog.region")}</Label>
          <Select
            value={values.region_id ? String(values.region_id) : ""}
            onValueChange={(v) => onChange("region_id", v ? Number(v) : null)}
          >
            <SelectTrigger className="h-8 text-sm">
              <SelectValue placeholder="Tanlang..." />
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
      </div>
    </div>
  );

  return (
    <>
      <Head>
        <title>{t("catalog.universities")} — Registry</title>
      </Head>
      <DashboardLayout>
        <div className="space-y-4 p-4 md:p-6">
          <h1 className="text-xl font-medium tracking-tight">{t("catalog.universities")}</h1>
          <CatalogCrud<University>
            title={t("catalog.universities")}
            addLabel={t("catalog.addUniversity")}
            columns={columns}
            data={universities}
            loading={isLoading}
            onAdd={(v) => addMut.mutateAsync(v as UniversityPayload)}
            onEdit={(id, v) => editMut.mutateAsync({ id, payload: v as UniversityPayload })}
            onDelete={(id) => deleteMut.mutateAsync(id)}
            renderForm={renderForm}
            initialValues={INITIAL}
            searchFields={["name_uz", "name_ru", "name_en", "short_name"]}
          />
        </div>
      </DashboardLayout>
    </>
  );
}
