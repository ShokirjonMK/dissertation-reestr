/**
 * Mamlakatlar katalogi sahifasi
 * CRUD: ko'rish, qo'shish, tahrirlash, o'chirish
 */
import Head from "next/head";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import DashboardLayout from "@/layouts/DashboardLayout";
import { CatalogCrud } from "@/components/dashboard/CatalogCrud";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useI18n } from "@/lib/i18n";
import * as api from "@/services/api";
import type { Country, CountryPayload } from "@/types";

const INITIAL: CountryPayload = { name_uz: "", name_ru: "", name_en: "", code: "" };

export default function CountriesPage() {
  const { t } = useI18n();
  const qc = useQueryClient();

  const { data: countries = [], isLoading } = useQuery({
    queryKey: ["countries"],
    queryFn: api.fetchCountries,
  });

  const addMut = useMutation({
    mutationFn: api.createCountry,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["countries"] });
      toast.success(t("common.success"));
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const editMut = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: CountryPayload }) =>
      api.updateCountry(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["countries"] });
      toast.success(t("common.success"));
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMut = useMutation({
    mutationFn: api.deleteCountry,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["countries"] });
      toast.success(t("common.success"));
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const columns = [
    { key: "code" as keyof Country, label: t("common.code"), className: "w-20 font-mono text-xs" },
    { key: "name_uz" as keyof Country, label: t("common.nameUz") },
    { key: "name_ru" as keyof Country, label: t("common.nameRu") },
    { key: "name_en" as keyof Country, label: t("common.nameEn") },
  ];

  const renderForm = (
    values: Partial<Country>,
    onChange: (key: keyof Country, value: unknown) => void
  ) => (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label className="text-xs">{t("common.code")} *</Label>
          <Input
            value={String(values.code ?? "")}
            onChange={(e) => onChange("code", e.target.value.toUpperCase())}
            placeholder="UZ"
            maxLength={10}
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">{t("common.nameUz")} *</Label>
          <Input
            value={String(values.name_uz ?? "")}
            onChange={(e) => onChange("name_uz", e.target.value)}
            placeholder="O'zbekiston"
          />
        </div>
      </div>
      <div className="space-y-1">
        <Label className="text-xs">{t("common.nameRu")}</Label>
        <Input
          value={String(values.name_ru ?? "")}
          onChange={(e) => onChange("name_ru", e.target.value)}
          placeholder="Узбекистан"
        />
      </div>
      <div className="space-y-1">
        <Label className="text-xs">{t("common.nameEn")}</Label>
        <Input
          value={String(values.name_en ?? "")}
          onChange={(e) => onChange("name_en", e.target.value)}
          placeholder="Uzbekistan"
        />
      </div>
    </div>
  );

  return (
    <>
      <Head>
        <title>{t("catalog.countries")} — Registry</title>
      </Head>
      <DashboardLayout>
        <div className="space-y-4 p-4 md:p-6">
          <h1 className="text-xl font-medium tracking-tight">{t("catalog.countries")}</h1>
          <CatalogCrud<Country>
            title={t("catalog.countries")}
            addLabel={t("catalog.addCountry")}
            columns={columns}
            data={countries}
            loading={isLoading}
            onAdd={(values) => void addMut.mutateAsync(values as CountryPayload)}
            onEdit={(id, values) => void editMut.mutateAsync({ id, payload: values as CountryPayload })}
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
