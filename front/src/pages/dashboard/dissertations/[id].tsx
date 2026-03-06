import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthGuard } from "@/hooks/use-auth-guard";
import DashboardLayout from "@/layouts/DashboardLayout";
import { fetchDissertation, fetchDissertationFile } from "@/services/api";
import type { DissertationFileKind } from "@/types";

export default function DissertationDetailsPage() {
  const router = useRouter();
  const { hasHydrated, isAuthenticated } = useAuthGuard();
  const [openingFileKind, setOpeningFileKind] = useState<DissertationFileKind | null>(null);

  const dissertationId = useMemo(() => {
    const raw = router.query.id;
    if (!raw || Array.isArray(raw)) {
      return null;
    }
    const parsed = Number(raw);
    return Number.isFinite(parsed) ? parsed : null;
  }, [router.query.id]);

  const detailsQuery = useQuery({
    queryKey: ["dissertation", dissertationId],
    queryFn: () => fetchDissertation(dissertationId as number),
    enabled: hasHydrated && isAuthenticated && Boolean(dissertationId),
  });

  const openFile = async (kind: DissertationFileKind) => {
    if (!dissertationId) {
      return;
    }
    try {
      setOpeningFileKind(kind);
      const { blob, filename } = await fetchDissertationFile(dissertationId, kind);
      const objectUrl = URL.createObjectURL(blob);

      if (blob.type.includes("pdf")) {
        const popup = window.open(objectUrl, "_blank");
        if (!popup) {
          const link = document.createElement("a");
          link.href = objectUrl;
          link.target = "_blank";
          link.rel = "noopener noreferrer";
          link.click();
        }
      } else {
        const link = document.createElement("a");
        link.href = objectUrl;
        link.download = filename;
        link.click();
      }

      setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Faylni ochishda xatolik");
    } finally {
      setOpeningFileKind(null);
    }
  };

  if (!hasHydrated) {
    return <div className="grid min-h-screen place-items-center text-sm text-muted-foreground">Session tekshirilmoqda...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  if (!dissertationId) {
    return (
      <DashboardLayout title="Dissertatsiya ma'lumotlari">
        <Card>
          <CardContent className="py-8 text-sm text-destructive">Noto&apos;g&apos;ri dissertatsiya ID.</CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  if (detailsQuery.isLoading) {
    return (
      <DashboardLayout title="Dissertatsiya ma'lumotlari">
        <Card>
          <CardContent className="py-8 text-sm text-muted-foreground">Yuklanmoqda...</CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  if (detailsQuery.isError || !detailsQuery.data) {
    return (
      <DashboardLayout title="Dissertatsiya ma'lumotlari">
        <Card>
          <CardContent className="py-8 text-sm text-destructive">
            {detailsQuery.error instanceof Error ? detailsQuery.error.message : "Ma'lumot topilmadi"}
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  const dissertation = detailsQuery.data;

  return (
    <DashboardLayout title="Dissertatsiya Tafsilotlari" subtitle={`ID: ${dissertation.id}`}>
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">{dissertation.title}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 text-sm">
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <p className="text-muted-foreground">Ilmiy yo&apos;nalish</p>
              <p>{dissertation.scientific_direction_name || dissertation.scientific_direction_id}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Universitet</p>
              <p>{dissertation.university_name || dissertation.university_id}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Muallif</p>
              <p>{dissertation.author_name || `User #${dissertation.author_id}`}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Ilmiy rahbar</p>
              <p>{dissertation.supervisor_name || "-"}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Himoya sanasi</p>
              <p>{dissertation.defense_date || "-"}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Status</p>
              <Badge variant="secondary">{dissertation.status}</Badge>
            </div>
          </div>

          <div>
            <p className="text-muted-foreground">Dissertatsiya muammosi</p>
            <p className="whitespace-pre-wrap">{dissertation.problem}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Dissertatsiya taklifi</p>
            <p className="whitespace-pre-wrap">{dissertation.proposal}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Dissertatsiya annotatsiyasi</p>
            <p className="whitespace-pre-wrap">{dissertation.annotation}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Dissertatsiya xulosasi</p>
            <p className="whitespace-pre-wrap">{dissertation.conclusion}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Kalit so&apos;zlar</p>
            <p>{(dissertation.keywords || []).join(", ") || "-"}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Avtoreferat va fayllar</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Avtoreferat matni</p>
            <p className="whitespace-pre-wrap">{dissertation.autoreferat_text || "Kiritilmagan"}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              disabled={!dissertation.has_autoreferat_file || openingFileKind !== null}
              onClick={() => void openFile("autoreferat")}
            >
              {openingFileKind === "autoreferat" ? "Ochilmoqda..." : "Avtoreferat faylini ko'rish"}
            </Button>
            <Button
              variant="outline"
              disabled={!dissertation.has_dissertation_pdf_file || openingFileKind !== null}
              onClick={() => void openFile("pdf")}
            >
              {openingFileKind === "pdf" ? "Ochilmoqda..." : "Dissertatsiya PDF faylini ko'rish"}
            </Button>
            <Button
              variant="outline"
              disabled={!dissertation.has_dissertation_word_file || openingFileKind !== null}
              onClick={() => void openFile("word")}
            >
              {openingFileKind === "word" ? "Yuklanmoqda..." : "Dissertatsiya Word fayli"}
            </Button>
          </div>

          <div>
            <p className="text-muted-foreground">Word fayldan olingan matn</p>
            <p className="whitespace-pre-wrap">{dissertation.dissertation_word_text || "Word fayl biriktirilmagan"}</p>
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
