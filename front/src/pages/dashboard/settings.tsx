import Head from "next/head";
import { useState } from "react";
import { User2, Mail, Shield, Palette, Languages, KeyRound, Bell } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAuthGuard } from "@/hooks/use-auth-guard";
import DashboardLayout from "@/layouts/DashboardLayout";
import { useI18n, type Lang } from "@/lib/i18n";
import { useUiStore } from "@/store/ui-store";
import { useAuthStore } from "@/store/auth-store";
import { toast } from "sonner";

const LANG_LABELS: Record<Lang, string> = { uz: "O'zbek", ru: "Русский", en: "English" };

export default function SettingsPage() {
  const { hasHydrated, isAuthenticated } = useAuthGuard();
  const { t, lang, setLang } = useI18n();
  const theme = useUiStore((s) => s.theme);
  const toggleTheme = useUiStore((s) => s.toggleTheme);
  const currentUser = useAuthStore((s) => s.user);

  const [notifEnabled, setNotifEnabled] = useState(true);
  const [pwCurrent, setPwCurrent] = useState("");
  const [pwNew, setPwNew] = useState("");
  const [pwConfirm, setPwConfirm] = useState("");

  if (!hasHydrated) {
    return (
      <div className="grid min-h-screen place-items-center text-sm text-muted-foreground">
        Session tekshirilmoqda...
      </div>
    );
  }
  if (!isAuthenticated) return null;

  function handlePasswordSave() {
    if (!pwNew || pwNew !== pwConfirm) {
      toast.error("Yangi parollar mos emas");
      return;
    }
    if (pwNew.length < 6) {
      toast.error("Parol kamida 6 ta belgidan iborat bo'lishi kerak");
      return;
    }
    toast.success("Parol muvaffaqiyatli o'zgartirildi");
    setPwCurrent("");
    setPwNew("");
    setPwConfirm("");
  }

  return (
    <>
      <Head>
        <title>Sozlamalar — Dissertation Registry</title>
      </Head>
      <DashboardLayout title={t("nav.settings")}>
        <div className="max-w-2xl space-y-4 animate-slide-up">

          {/* Profile */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <User2 className="h-4 w-4 text-primary" />
                Profil ma&apos;lumotlari
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-xl font-semibold text-primary">
                  {currentUser?.username?.[0]?.toUpperCase() ?? "U"}
                </div>
                <div>
                  <p className="font-medium">{currentUser?.username}</p>
                  <p className="text-sm text-muted-foreground capitalize">
                    {t(`role.${currentUser?.role.name}` as Parameters<typeof t>[0]) ?? currentUser?.role.name}
                  </p>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <User2 className="h-3 w-3" /> Foydalanuvchi nomi
                  </Label>
                  <Input value={currentUser?.username ?? ""} readOnly className="bg-muted/30" />
                </div>
                <div className="space-y-1.5">
                  <Label className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Mail className="h-3 w-3" /> Email
                  </Label>
                  <Input value={currentUser?.email ?? ""} readOnly className="bg-muted/30" />
                </div>
                <div className="space-y-1.5">
                  <Label className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Shield className="h-3 w-3" /> Rol
                  </Label>
                  <Input
                    value={t(`role.${currentUser?.role.name}` as Parameters<typeof t>[0]) ?? currentUser?.role.name ?? ""}
                    readOnly
                    className="bg-muted/30 capitalize"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Password */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <KeyRound className="h-4 w-4 text-primary" />
                Parolni o&apos;zgartirish
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Joriy parol</Label>
                <Input
                  type="password"
                  value={pwCurrent}
                  onChange={(e) => setPwCurrent(e.target.value)}
                  placeholder="••••••••"
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Yangi parol</Label>
                  <Input
                    type="password"
                    value={pwNew}
                    onChange={(e) => setPwNew(e.target.value)}
                    placeholder="••••••••"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Yangi parolni takrorlang</Label>
                  <Input
                    type="password"
                    value={pwConfirm}
                    onChange={(e) => setPwConfirm(e.target.value)}
                    placeholder="••••••••"
                  />
                </div>
              </div>
              <Button size="sm" onClick={handlePasswordSave} className="gap-1.5">
                <KeyRound className="h-3.5 w-3.5" />
                Saqlash
              </Button>
            </CardContent>
          </Card>

          {/* Appearance */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Palette className="h-4 w-4 text-primary" />
                Ko&apos;rinish
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Qorong&apos;i rejim</p>
                  <p className="text-xs text-muted-foreground">Interfeys rangini qorong&apos;iga o&apos;zgartirish</p>
                </div>
                <Switch checked={theme === "dark"} onCheckedChange={toggleTheme} />
              </div>
              <div>
                <p className="mb-2 text-sm font-medium">Til</p>
                <div className="flex gap-2">
                  {(["uz", "ru", "en"] as Lang[]).map((l) => (
                    <button
                      key={l}
                      type="button"
                      onClick={() => setLang(l)}
                      className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${
                        lang === l
                          ? "border-primary bg-primary/10 text-primary font-medium"
                          : "border-border text-muted-foreground hover:border-primary/50"
                      }`}
                    >
                      {LANG_LABELS[l]}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Bell className="h-4 w-4 text-primary" />
                Bildirishnomalar
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Yangi dissertatsiyalar</p>
                  <p className="text-xs text-muted-foreground">Yangi ariza kelib tushganda xabar</p>
                </div>
                <Switch checked={notifEnabled} onCheckedChange={setNotifEnabled} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Status o&apos;zgarishlari</p>
                  <p className="text-xs text-muted-foreground">Dissertatsiya holati o&apos;zgarganda xabar</p>
                </div>
                <Switch checked={notifEnabled} onCheckedChange={setNotifEnabled} />
              </div>
            </CardContent>
          </Card>

        </div>
      </DashboardLayout>
    </>
  );
}
