import { useMutation, useQuery } from "@tanstack/react-query";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAuthGuard } from "@/hooks/use-auth-guard";
import DashboardLayout from "@/layouts/DashboardLayout";
import { createDissertation, fetchCatalog, fetchMe, fetchUserLookup } from "@/services/api";
import { useAuthStore } from "@/store/auth-store";

export default function DissertationCreatePage() {
  const router = useRouter();
  const { hasHydrated, isAuthenticated } = useAuthGuard();
  const allowed = hasHydrated && isAuthenticated;
  const storedUser = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);

  const meQuery = useQuery({
    queryKey: ["auth", "me"],
    queryFn: fetchMe,
    enabled: allowed && !storedUser,
  });

  useEffect(() => {
    if (meQuery.data) {
      setUser(meQuery.data);
    }
  }, [meQuery.data, setUser]);

  const currentUser = storedUser || meQuery.data;
  const isAdmin = currentUser?.role.name === "admin";
  const canCreate = currentUser?.role.name === "admin" || currentUser?.role.name === "doctorant";

  const directionsQuery = useQuery({
    queryKey: ["catalog", "directions"],
    queryFn: () => fetchCatalog("scientific-directions"),
    enabled: allowed,
  });
  const universitiesQuery = useQuery({
    queryKey: ["catalog", "universities"],
    queryFn: () => fetchCatalog("universities"),
    enabled: allowed,
  });
  const regionsQuery = useQuery({
    queryKey: ["catalog", "regions"],
    queryFn: () => fetchCatalog("regions"),
    enabled: allowed,
  });
  const supervisorsQuery = useQuery({
    queryKey: ["users", "lookup", "supervisor"],
    queryFn: () => fetchUserLookup("supervisor"),
    enabled: allowed,
  });
  const authorsQuery = useQuery({
    queryKey: ["users", "lookup", "authors"],
    queryFn: () => fetchUserLookup(),
    enabled: allowed && isAdmin,
  });

  const [title, setTitle] = useState("");
  const [scientificDirectionId, setScientificDirectionId] = useState("");
  const [universityId, setUniversityId] = useState("");
  const [authorId, setAuthorId] = useState("");
  const [supervisorId, setSupervisorId] = useState("");
  const [regionId, setRegionId] = useState("");
  const [problem, setProblem] = useState("");
  const [proposal, setProposal] = useState("");
  const [annotation, setAnnotation] = useState("");
  const [conclusion, setConclusion] = useState("");
  const [keywords, setKeywords] = useState("");
  const [defenseDate, setDefenseDate] = useState("");
  const [statusValue, setStatusValue] = useState("draft");
  const [category, setCategory] = useState("general");
  const [expertRating, setExpertRating] = useState("0");
  const [visibility, setVisibility] = useState("internal");
  const [autoreferatText, setAutoreferatText] = useState("");
  const [autoreferatFile, setAutoreferatFile] = useState<File | null>(null);
  const [dissertationPdfFile, setDissertationPdfFile] = useState<File | null>(null);
  const [dissertationWordFile, setDissertationWordFile] = useState<File | null>(null);

  const defaultAuthorId = useMemo(() => String(currentUser?.id || ""), [currentUser?.id]);

  const createMutation = useMutation({
    mutationFn: async () => {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("scientific_direction_id", scientificDirectionId);
      formData.append("university_id", universityId);
      formData.append("problem", problem);
      formData.append("proposal", proposal);
      formData.append("annotation", annotation);
      formData.append("conclusion", conclusion);
      formData.append("keywords", keywords);
      formData.append("status", statusValue);
      formData.append("category", category);
      formData.append("expert_rating", expertRating || "0");
      formData.append("visibility", visibility);
      formData.append("autoreferat_text", autoreferatText);

      if (isAdmin && authorId) {
        formData.append("author_id", authorId);
      }
      if (!isAdmin && defaultAuthorId) {
        formData.append("author_id", defaultAuthorId);
      }
      if (supervisorId) {
        formData.append("supervisor_id", supervisorId);
      }
      if (regionId) {
        formData.append("region_id", regionId);
      }
      if (defenseDate) {
        formData.append("defense_date", defenseDate);
      }
      if (autoreferatFile) {
        formData.append("autoreferat_file", autoreferatFile);
      }
      if (dissertationPdfFile) {
        formData.append("dissertation_pdf_file", dissertationPdfFile);
      }
      if (dissertationWordFile) {
        formData.append("dissertation_word_file", dissertationWordFile);
      }

      return createDissertation(formData);
    },
    onSuccess: (created) => {
      toast.success("Dissertatsiya muvaffaqiyatli qo'shildi");
      void router.push(`/dashboard/dissertations/${created.id}`);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Saqlashda xatolik");
    },
  });

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (createMutation.isPending) {
      return;
    }
    if (!canCreate) {
      toast.error("Sizda dissertatsiya yaratish huquqi yo'q");
      return;
    }
    await createMutation.mutateAsync();
  };

  if (!hasHydrated) {
    return <div className="grid min-h-screen place-items-center text-sm text-muted-foreground">Session tekshirilmoqda...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <DashboardLayout title="Dissertatsiya Qo'shish" subtitle="To'liq ma'lumotlar va fayllarni bir joyda saqlash">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Yangi dissertatsiya</CardTitle>
        </CardHeader>
        <CardContent>
          {!canCreate ? (
            <p className="text-sm text-destructive">Ushbu amal faqat Admin yoki Doktorant roli uchun ruxsat etilgan.</p>
          ) : (
            <form className="space-y-4" onSubmit={onSubmit}>
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm">Dissertatsiya nomi</label>
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
                </div>

                <div>
                  <label className="mb-1 block text-sm">Ilmiy yo&apos;nalish</label>
                  <Select value={scientificDirectionId || undefined} onValueChange={setScientificDirectionId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Yo'nalishni tanlang" />
                    </SelectTrigger>
                    <SelectContent>
                      {(directionsQuery.data || []).map((item) => (
                        <SelectItem key={item.id} value={String(item.id)}>
                          {item.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="mb-1 block text-sm">Universitet</label>
                  <Select value={universityId || undefined} onValueChange={setUniversityId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Universitetni tanlang" />
                    </SelectTrigger>
                    <SelectContent>
                      {(universitiesQuery.data || []).map((item) => (
                        <SelectItem key={item.id} value={String(item.id)}>
                          {item.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="mb-1 block text-sm">Muallif</label>
                  {isAdmin ? (
                    <Select value={authorId || undefined} onValueChange={setAuthorId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Muallifni tanlang" />
                      </SelectTrigger>
                      <SelectContent>
                        {(authorsQuery.data || []).map((item) => (
                          <SelectItem key={item.id} value={String(item.id)}>
                            {item.username} ({item.role_name})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input value={currentUser?.username || ""} disabled />
                  )}
                </div>

                <div>
                  <label className="mb-1 block text-sm">Ilmiy rahbar</label>
                  <Select value={supervisorId || undefined} onValueChange={setSupervisorId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Rahbarni tanlang" />
                    </SelectTrigger>
                    <SelectContent>
                      {(supervisorsQuery.data || []).map((item) => (
                        <SelectItem key={item.id} value={String(item.id)}>
                          {item.username}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="mb-1 block text-sm">Hudud (ixtiyoriy)</label>
                  <Select value={regionId || "none"} onValueChange={(value) => setRegionId(value === "none" ? "" : value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Hudud tanlang" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Tanlanmagan</SelectItem>
                      {(regionsQuery.data || []).map((item) => (
                        <SelectItem key={item.id} value={String(item.id)}>
                          {item.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="mb-1 block text-sm">Himoya sanasi</label>
                  <Input type="date" value={defenseDate} onChange={(e) => setDefenseDate(e.target.value)} />
                </div>

                <div>
                  <label className="mb-1 block text-sm">Status</label>
                  <Select value={statusValue} onValueChange={setStatusValue}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">draft</SelectItem>
                      <SelectItem value="pending">pending</SelectItem>
                      <SelectItem value="approved">approved</SelectItem>
                      <SelectItem value="rejected">rejected</SelectItem>
                      <SelectItem value="defended">defended</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="mb-1 block text-sm">Kategoriya</label>
                  <Input value={category} onChange={(e) => setCategory(e.target.value)} />
                </div>

                <div>
                  <label className="mb-1 block text-sm">Expert rating</label>
                  <Input type="number" min={0} max={100} step={0.1} value={expertRating} onChange={(e) => setExpertRating(e.target.value)} />
                </div>

                <div>
                  <label className="mb-1 block text-sm">Ko&apos;rinish</label>
                  <Select value={visibility} onValueChange={setVisibility}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="internal">internal</SelectItem>
                      <SelectItem value="public">public</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="mb-1 block text-sm">Kalit so&apos;zlar (vergul bilan)</label>
                  <Input value={keywords} onChange={(e) => setKeywords(e.target.value)} />
                </div>
              </div>

              <div className="grid gap-3">
                <div>
                  <label className="mb-1 block text-sm">Dissertatsiya muammosi</label>
                  <Textarea value={problem} onChange={(e) => setProblem(e.target.value)} required />
                </div>
                <div>
                  <label className="mb-1 block text-sm">Dissertatsiya taklifi</label>
                  <Textarea value={proposal} onChange={(e) => setProposal(e.target.value)} required />
                </div>
                <div>
                  <label className="mb-1 block text-sm">Dissertatsiya annotatsiyasi</label>
                  <Textarea value={annotation} onChange={(e) => setAnnotation(e.target.value)} required />
                </div>
                <div>
                  <label className="mb-1 block text-sm">Dissertatsiya xulosasi</label>
                  <Textarea value={conclusion} onChange={(e) => setConclusion(e.target.value)} required />
                </div>
                <div>
                  <label className="mb-1 block text-sm">Avtoreferat matni (alohida)</label>
                  <Textarea value={autoreferatText} onChange={(e) => setAutoreferatText(e.target.value)} />
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                <div>
                  <label className="mb-1 block text-sm">Avtoreferat fayli</label>
                  <Input
                    type="file"
                    accept=".pdf,.doc,.docx,.txt"
                    onChange={(e) => setAutoreferatFile(e.target.files?.[0] || null)}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm">Dissertatsiya PDF fayli</label>
                  <Input type="file" accept=".pdf" onChange={(e) => setDissertationPdfFile(e.target.files?.[0] || null)} />
                </div>
                <div>
                  <label className="mb-1 block text-sm">Dissertatsiya Word fayli</label>
                  <Input
                    type="file"
                    accept=".doc,.docx"
                    onChange={(e) => setDissertationWordFile(e.target.files?.[0] || null)}
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  type="submit"
                  disabled={
                    createMutation.isPending ||
                    !title ||
                    !scientificDirectionId ||
                    !universityId ||
                    !problem ||
                    !proposal ||
                    !annotation ||
                    !conclusion
                  }
                >
                  {createMutation.isPending ? "Saqlanmoqda..." : "Saqlash"}
                </Button>
                <Button type="button" variant="outline" onClick={() => void router.push("/dashboard/dissertations")}>
                  Bekor qilish
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
