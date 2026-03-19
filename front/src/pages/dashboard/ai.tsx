import Head from "next/head";

import AIAssistantChat from "@/components/dashboard/AIAssistantChat";
import { useAuthGuard } from "@/hooks/use-auth-guard";
import DashboardLayout from "@/layouts/DashboardLayout";
import { useI18n } from "@/lib/i18n";

export default function AIPage() {
  const { hasHydrated, isAuthenticated } = useAuthGuard();
  const { t } = useI18n();

  if (!hasHydrated) {
    return (
      <div className="grid min-h-screen place-items-center text-sm text-muted-foreground">
        Session tekshirilmoqda...
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <>
      <Head>
        <title>AI Yordamchi — Dissertation Registry</title>
      </Head>
      <DashboardLayout title={t("nav.ai")}>
        <AIAssistantChat fullPage />
      </DashboardLayout>
    </>
  );
}
