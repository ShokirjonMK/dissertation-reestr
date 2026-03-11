/**
 * Dissertatsiya yuklash — 6 bosqichli Wizard
 */
"use client";

import Head from "next/head";
import { useRouter } from "next/router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Check, ChevronRight } from "lucide-react";

import DashboardLayout from "@/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { TagInput } from "@/components/ui/tag-input";
import { FileUpload } from "@/components/ui/file-upload";
import { AuthorSelectModal } from "@/components/dashboard/AuthorSelectModal";
import { useI18n } from "@/lib/i18n";
import { useAuthStore } from "@/store/auth-store";
import * as api from "@/services/api";
import type { DissertationWizardData } from "@/types";

const TOTAL_STEPS = 6;

const INITIAL_DATA: DissertationWizardData = {
  title: "",
  scientific_direction_id: null,
  university_id: null,
  country_id: null,
  region_id: null,
  defense_date: "",
  problem: "",
  proposal: "",
  keywords: [],
  annotation: "",
  conclusion: "",
  author_id: null,
  supervisor_id: null,
  autoreferat_file: null,
  dissertation_pdf_file: null,
  dissertation_word_file: null,
  category: "general",
  visibility: "internal",
};

const KEYWORD_SUGGESTIONS = [
  "konstitutsion huquq", "fuqarolik huquqi", "jinoyat huquqi", "ma'muriy huquq",
  "xalqaro huquq", "mehnat huquqi", "tijorat huquqi", "mediatsiya", "arbitraj",
  "raqamlashtirish", "blockchain", "elektron hukumat", "sud islohotlari",
  "huquqiy davlat", "inson huquqlari", "korrupsiyaga qarshi", "notariatchilik",
];

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      <span className="w-36 shrink-0 text-xs text-muted-foreground">{label}:</span>
      <span className="font-medium">{value || "—"}</span>
    </div>
  );
}

export default function NewDissertationPage() {
  const { t } = useI18n();
  const router = useRouter();
  const currentUser = useAuthStore((s) => s.user);

  const [step, setStep] = useState(1);
  const [data, setData] = useState<DissertationWizardData>({
    ...INITIAL_DATA,
    author_id: currentUser?.id ?? null,
  });
  const [authorLabel, setAuthorLabel] = useState(currentUser?.username ?? "");
  const [supervisorLabel, setSupervisorLabel] = useState("");
  const [authorModalOpen, setAuthorModalOpen] = useState(false);
  const [supervisorModalOpen, setSupervisorModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { data: directions = [] } = useQuery({ queryKey: ["scientific-directions"], queryFn: api.fetchScientificDirections });
  const { data: universities = [] } = useQuery({ queryKey: ["universities"], queryFn: api.fetchUniversities });
  const { data: countries = [] } = useQuery({ queryKey: ["countries"], queryFn: api.fetchCountries });
  const { data: regions = [] } = useQuery({ queryKey: ["regions"], queryFn: api.fetchRegions });

  const set = <K extends keyof DissertationWizardData>(key: K, value: DissertationWizardData[K]) => {
    setData((prev) => ({ ...prev, [key]: value }));
  };

  const steps = [
    t("wizard.step1"), t("wizard.step2"), t("wizard.step3"),
    t("wizard.step4"), t("wizard.step5"), t("wizard.step6"),
  ];

  const canNext = (): boolean => {
    if (step === 1) return !!data.title.trim() && !!data.scientific_direction_id && !!data.university_id;
    if (step === 2) return !!data.problem.trim() && !!data.proposal.trim();
    if (step === 3) return data.keywords.length > 0 && !!data.annotation.trim();
    if (step === 4) return !!data.author_id;
    return true;
  };

  const handleSubmit = async () => {
    if (!data.author_id || !data.scientific_direction_id || !data.university_id) {
      toast.error("Majburiy maydonlarni to'ldiring");
      return;
    }
    setSubmitting(true);
    try {
      const formData = new FormData();
      const fields: (keyof DissertationWizardData)[] = [
        "title", "scientific_direction_id", "university_id", "country_id",
        "region_id", "defense_date", "problem", "proposal", "annotation",
        "conclusion", "author_id", "supervisor_id", "category", "visibility",
      ];
      fields.forEach((field) => {
        const val = data[field];
        if (val !== null && val !== undefined && val !== "") {
          formData.append(field, String(val));
        }
      });
      formData.append("keywords", JSON.stringify(data.keywords));
      if (data.autoreferat_file) formData.append("autoreferat_file", data.autoreferat_file);
      if (data.dissertation_pdf_file) formData.append("dissertation_pdf_file", data.dissertation_pdf_file);
      if (data.dissertation_word_file) formData.append("dissertation_word_file", data.dissertation_word_file);

      await api.createDissertation(formData);
      toast.success("Dissertatsiya muvaffaqiyatli yuklandi!");
      void router.push("/dashboard/dissertations");
    } catch (e: unknown) {
      toast.error((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  // Standart qiymatlar
  const uzbekistanId = countries.find((c) => c.code === "UZ")?.id;
  const tdyuId = universities.find((u) => u.name_uz?.includes("Toshkent Davlat Yuridik"))?.id;
  if (uzbekistanId && !data.country_id) set("country_id", uzbekistanId);
  if (tdyuId && !data.university_id) set("university_id", tdyuId);

  return (
    <>
      <Head>
        <title>{t("dissertation.addNew")} — Registry</title>
      </Head>
      <DashboardLayout>
        <div className="mx-auto max-w-2xl space-y-4 p-4 md:p-6">
          <h1 className="text-xl font-medium tracking-tight">{t("dissertation.addNew")}</h1>

          {/* Wizard progress */}
          <nav aria-label="Wizard bosqichlari">
            <ol className="flex items-center gap-1 overflow-x-auto pb-1">
              {steps.map((stepLabel, idx) => {
                const num = idx + 1;
                const done = step > num;
                const active = step === num;
                return (
                  <li key={num} className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => done && setStep(num)}
                      className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium transition-colors ${
                        done ? "bg-primary text-primary-foreground cursor-pointer"
                        : active ? "border-2 border-primary bg-primary/10 text-primary"
                        : "border border-border/60 bg-muted/30 text-muted-foreground"
                      }`}
                    >
                      {done ? <Check className="h-3.5 w-3.5" /> : num}
                    </button>
                    <span className={`hidden text-xs sm:inline ${active ? "font-medium text-primary" : "text-muted-foreground"}`}>
                      {stepLabel}
                    </span>
                    {num < TOTAL_STEPS && <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />}
                  </li>
                );
              })}
            </ol>
          </nav>

          <Card className="border-border/60 bg-white/70 shadow-sm backdrop-blur dark:bg-slate-900/60">
            <CardContent className="space-y-4 pt-5">

              {/* Step 1 */}
              {step === 1 && (
                <div className="space-y-3">
                  <h2 className="text-base font-medium">{t("wizard.step1")}</h2>
                  <div className="space-y-1">
                    <Label className="text-xs">{t("dissertation.title")} *</Label>
                    <Input value={data.title} onChange={(e) => set("title", e.target.value)} placeholder="Dissertatsiya nomini kiriting..." />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">{t("dissertation.direction")} *</Label>
                    <Select value={data.scientific_direction_id ? String(data.scientific_direction_id) : ""} onValueChange={(v) => set("scientific_direction_id", Number(v))}>
                      <SelectTrigger><SelectValue placeholder="Yo'nalish tanlang..." /></SelectTrigger>
                      <SelectContent>
                        {directions.map((d) => <SelectItem key={d.id} value={String(d.id)}>{d.name_uz}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">{t("dissertation.country")}</Label>
                      <Select value={data.country_id ? String(data.country_id) : ""} onValueChange={(v) => set("country_id", Number(v))}>
                        <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="Mamlakat..." /></SelectTrigger>
                        <SelectContent>
                          {countries.map((c) => <SelectItem key={c.id} value={String(c.id)}>{c.name_uz}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">{t("dissertation.region")}</Label>
                      <Select value={data.region_id ? String(data.region_id) : ""} onValueChange={(v) => set("region_id", Number(v))}>
                        <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="Region..." /></SelectTrigger>
                        <SelectContent>
                          {regions.filter((r) => !data.country_id || r.country_id === data.country_id).map((r) => (
                            <SelectItem key={r.id} value={String(r.id)}>{r.name_uz}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">{t("dissertation.university")} *</Label>
                    <Select value={data.university_id ? String(data.university_id) : ""} onValueChange={(v) => set("university_id", Number(v))}>
                      <SelectTrigger><SelectValue placeholder="Universitet tanlang..." /></SelectTrigger>
                      <SelectContent>
                        {universities.map((u) => <SelectItem key={u.id} value={String(u.id)}>{u.short_name ? `${u.short_name} — ` : ""}{u.name_uz}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">{t("dissertation.defenseDate")}</Label>
                    <Input type="date" value={data.defense_date} onChange={(e) => set("defense_date", e.target.value)} className="h-8 text-sm" />
                  </div>
                </div>
              )}

              {/* Step 2 */}
              {step === 2 && (
                <div className="space-y-3">
                  <h2 className="text-base font-medium">{t("wizard.step2")}</h2>
                  <div className="space-y-1">
                    <Label className="text-xs">{t("dissertation.problem")} *</Label>
                    <Textarea value={data.problem} onChange={(e) => set("problem", e.target.value)} placeholder="Muammo..." rows={4} className="resize-none" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">{t("dissertation.proposal")} *</Label>
                    <Textarea value={data.proposal} onChange={(e) => set("proposal", e.target.value)} placeholder="Taklif..." rows={4} className="resize-none" />
                  </div>
                </div>
              )}

              {/* Step 3 */}
              {step === 3 && (
                <div className="space-y-3">
                  <h2 className="text-base font-medium">{t("wizard.step3")}</h2>
                  <div className="space-y-1">
                    <Label className="text-xs">{t("dissertation.keywords")} *</Label>
                    <TagInput value={data.keywords} onChange={(tags) => set("keywords", tags)} suggestions={KEYWORD_SUGGESTIONS} placeholder="Kalit so'z kiriting..." />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">{t("dissertation.annotation")} *</Label>
                    <Textarea value={data.annotation} onChange={(e) => set("annotation", e.target.value)} placeholder="Annotatsiya..." rows={4} className="resize-none" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">{t("dissertation.conclusion")}</Label>
                    <Textarea value={data.conclusion} onChange={(e) => set("conclusion", e.target.value)} placeholder="Xulosa..." rows={3} className="resize-none" />
                  </div>
                </div>
              )}

              {/* Step 4 */}
              {step === 4 && (
                <div className="space-y-3">
                  <h2 className="text-base font-medium">{t("wizard.step4")}</h2>
                  <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-muted/30 p-3">
                    <input type="checkbox" id="selfAuthor" checked={data.author_id === currentUser?.id}
                      onChange={(e) => {
                        if (e.target.checked) { set("author_id", currentUser?.id ?? null); setAuthorLabel(currentUser?.username ?? ""); }
                        else { set("author_id", null); setAuthorLabel(""); }
                      }} className="rounded" />
                    <label htmlFor="selfAuthor" className="text-sm cursor-pointer">{t("author.selfSubmit")} ({currentUser?.username})</label>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">{t("dissertation.author")} *</Label>
                    <div className="flex gap-2">
                      <Input readOnly value={authorLabel} placeholder={t("author.select")} className="flex-1 cursor-pointer bg-muted/30" onClick={() => setAuthorModalOpen(true)} />
                      <Button type="button" variant="outline" size="sm" onClick={() => setAuthorModalOpen(true)}>Tanlash</Button>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">{t("dissertation.supervisor")}</Label>
                    <div className="flex gap-2">
                      <Input readOnly value={supervisorLabel} placeholder="Rahbar tanlang (ixtiyoriy)" className="flex-1 cursor-pointer bg-muted/30" onClick={() => setSupervisorModalOpen(true)} />
                      <Button type="button" variant="outline" size="sm" onClick={() => setSupervisorModalOpen(true)}>Tanlash</Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 5 */}
              {step === 5 && (
                <div className="space-y-4">
                  <h2 className="text-base font-medium">{t("wizard.step5")}</h2>
                  <FileUpload value={data.autoreferat_file} onChange={(f) => set("autoreferat_file", f)} label={`📄 ${t("dissertation.autoreferat")} (PDF, DOCX)`} />
                  <FileUpload value={data.dissertation_pdf_file} onChange={(f) => set("dissertation_pdf_file", f)} label={`📄 ${t("dissertation.dissertationPdf")}`} accept=".pdf" />
                  <FileUpload value={data.dissertation_word_file} onChange={(f) => set("dissertation_word_file", f)} label={`📄 ${t("dissertation.dissertationWord")}`} accept=".docx,.doc" />
                  <p className="text-xs text-muted-foreground">Fayllar avtomatik matn ko&apos;rinishiga o&apos;tkaziladi va AI uchun indekslanadi.</p>
                </div>
              )}

              {/* Step 6 */}
              {step === 6 && (
                <div className="space-y-3">
                  <h2 className="text-base font-medium">{t("wizard.step6")}</h2>
                  <div className="space-y-2 rounded-lg border border-border/60 bg-muted/20 p-4 text-sm">
                    <Row label={t("dissertation.title")} value={data.title} />
                    <Row label={t("dissertation.direction")} value={directions.find((d) => d.id === data.scientific_direction_id)?.name_uz ?? "—"} />
                    <Row label={t("dissertation.university")} value={universities.find((u) => u.id === data.university_id)?.name_uz ?? "—"} />
                    <Row label={t("dissertation.country")} value={countries.find((c) => c.id === data.country_id)?.name_uz ?? "—"} />
                    <Row label={t("dissertation.author")} value={authorLabel || "—"} />
                    <Row label={t("dissertation.supervisor")} value={supervisorLabel || "—"} />
                    <div>
                      <span className="text-xs text-muted-foreground">{t("dissertation.keywords")}:</span>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {data.keywords.map((k) => (
                          <span key={k} className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">{k}</span>
                        ))}
                      </div>
                    </div>
                    <div className="border-t border-border/40 pt-2">
                      <p className="text-xs text-muted-foreground">Fayllar:</p>
                      <ul className="mt-1 space-y-0.5 text-xs">
                        <li>Autoreferat: {data.autoreferat_file?.name ?? "Yuklanmagan"}</li>
                        <li>PDF: {data.dissertation_pdf_file?.name ?? "Yuklanmagan"}</li>
                        <li>DOCX: {data.dissertation_word_file?.name ?? "Yuklanmagan"}</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="flex items-center justify-between border-t border-border/40 pt-4">
                <Button variant="outline" size="sm" onClick={() => setStep((s) => Math.max(1, s - 1))} disabled={step === 1}>
                  {t("wizard.prev")}
                </Button>
                <span className="text-xs text-muted-foreground">{step} / {TOTAL_STEPS}</span>
                {step < TOTAL_STEPS ? (
                  <Button size="sm" onClick={() => setStep((s) => s + 1)} disabled={!canNext()}>
                    {t("wizard.next")}
                  </Button>
                ) : (
                  <Button size="sm" onClick={handleSubmit} disabled={submitting}>
                    {submitting ? "Yuborilmoqda..." : t("wizard.submit")}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <AuthorSelectModal open={authorModalOpen} onClose={() => setAuthorModalOpen(false)}
          onSelect={(id, label) => { set("author_id", id); setAuthorLabel(label); }}
          excludeId={data.supervisor_id ?? undefined} />
        <AuthorSelectModal open={supervisorModalOpen} onClose={() => setSupervisorModalOpen(false)}
          onSelect={(id, label) => { set("supervisor_id", id); setSupervisorLabel(label); }}
          excludeId={data.author_id ?? undefined} />
      </DashboardLayout>
    </>
  );
}
