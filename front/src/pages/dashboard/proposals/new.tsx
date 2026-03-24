import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuthGuard } from "@/hooks/use-auth-guard";
import DashboardLayout from "@/layouts/DashboardLayout";
import { createImplementationProposal, fetchDissertations, submitImplementationProposal } from "@/services/api";

const schema = z.object({
  dissertation_id: z
    .string()
    .refine(
      (v) => v.trim() === "" || (!Number.isNaN(Number(v)) && Number(v) > 0),
      "Noto'g'ri dissertatsiya tanlovi"
    )
    .transform((v) => (v.trim() === "" ? undefined : Number(v))),
  title: z.string().min(5).max(500),
  problem_description: z.string().min(20),
  proposal_text: z.string().min(20),
  expected_result: z.string().min(10),
  implementation_area: z.string().min(2),
  implementation_org: z.string().min(2),
  priority: z.enum(["low", "medium", "high", "critical"]).default("medium"),
  source_chapter: z.string().optional(),
  source_pages: z.string().optional(),
});

type ProposalFormInput = z.input<typeof schema>;

export default function NewProposalPage() {
  const router = useRouter();
  const { hasHydrated, isAuthenticated } = useAuthGuard();

  const dissQuery = useQuery({
    queryKey: ["dissertations-for-proposal"],
    queryFn: () => fetchDissertations(),
    enabled: hasHydrated && isAuthenticated,
  });

  const form = useForm<ProposalFormInput>({
    resolver: zodResolver(schema),
    defaultValues: {
      dissertation_id: "",
      title: "",
      problem_description: "",
      proposal_text: "",
      expected_result: "",
      implementation_area: "",
      implementation_org: "",
      priority: "medium",
      source_chapter: "",
      source_pages: "",
    },
  });

  const saveDraft = form.handleSubmit(async (values) => {
    try {
      const created = await createImplementationProposal(values);
      toast.success("Qoralama saqlandi");
      await router.push(`/dashboard/proposals/${created.id}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Xato");
    }
  });

  const saveAndSubmit = form.handleSubmit(async (values) => {
    try {
      const created = await createImplementationProposal(values);
      await submitImplementationProposal(created.id);
      toast.success("Taklif yuborildi");
      await router.push(`/dashboard/proposals/${created.id}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Xato");
    }
  });

  if (!hasHydrated) {
    return (
      <div className="grid min-h-screen place-items-center text-sm text-muted-foreground">Session tekshirilmoqda...</div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <DashboardLayout title="Yangi taklif" subtitle="Amaliyotga joriy etish">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Maydonlar</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label>Dissertatsiya (ixtiyoriy)</Label>
            <p className="text-xs text-muted-foreground">
              Muammo va yechimni avval yozishingiz mumkin; dissertatsiyani keyin bog&apos;lash mumkin.
            </p>
            <select
              className="rounded-md border border-input bg-background px-2 py-2 text-sm"
              value={form.watch("dissertation_id")}
              onChange={(e) => form.setValue("dissertation_id", e.target.value, { shouldValidate: true })}
            >
              <option value="">Hozircha bog&apos;lanmagan</option>
              {(dissQuery.data || []).map((d) => (
                <option key={d.id} value={d.id}>
                  #{d.id} — {d.title}
                </option>
              ))}
            </select>
            {form.formState.errors.dissertation_id && (
              <p className="text-xs text-destructive">{form.formState.errors.dissertation_id.message}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label>Sarlavha</Label>
            <Input {...form.register("title")} />
            {form.formState.errors.title && (
              <p className="text-xs text-destructive">{form.formState.errors.title.message}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label>Muammo tavsifi</Label>
            <Textarea className="min-h-[100px]" {...form.register("problem_description")} />
            {form.formState.errors.problem_description && (
              <p className="text-xs text-destructive">{form.formState.errors.problem_description.message}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label>Taklif matni</Label>
            <Textarea className="min-h-[100px]" {...form.register("proposal_text")} />
            {form.formState.errors.proposal_text && (
              <p className="text-xs text-destructive">{form.formState.errors.proposal_text.message}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label>Kutilayotgan natija</Label>
            <Textarea className="min-h-[80px]" {...form.register("expected_result")} />
            {form.formState.errors.expected_result && (
              <p className="text-xs text-destructive">{form.formState.errors.expected_result.message}</p>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label>Amaliyot sohasi</Label>
              <Input {...form.register("implementation_area")} />
            </div>
            <div className="grid gap-2">
              <Label>Tashkilot</Label>
              <Input {...form.register("implementation_org")} />
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Muhimlik</Label>
            <select
              className="rounded-md border border-input bg-background px-2 py-2 text-sm"
              {...form.register("priority")}
            >
              <option value="low">Past</option>
              <option value="medium">O&apos;rta</option>
              <option value="high">Yuqori</option>
              <option value="critical">Kritik</option>
            </select>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label>Manba bob (ixtiyoriy)</Label>
              <Input {...form.register("source_chapter")} />
            </div>
            <div className="grid gap-2">
              <Label>Manba sahifalar (ixtiyoriy)</Label>
              <Input {...form.register("source_pages")} />
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => void saveDraft()}>
              Qoralama saqlash
            </Button>
            <Button type="button" onClick={() => void saveAndSubmit()}>
              Yuborish
            </Button>
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
