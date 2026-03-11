/**
 * AuthorSelectModal — Muallif tanlash yoki yaratish modali
 *
 * 3 usul bilan yaratish:
 *  1. To'liq ism (last_name, first_name, middle_name)
 *  2. JSHSHIR (14 raqam) — tashqi API orqali
 *  3. Pasport ma'lumotlari (seria + raqam + tug'ilgan sana) — tashqi API
 *
 * Mavjud foydalanuvchilardan ham tanlash mumkin
 */
"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, UserPlus, User, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useI18n } from "@/lib/i18n";
import * as api from "@/services/api";
import type { UserLookup } from "@/types";

type AuthorSelectModalProps = {
  open: boolean;
  onClose: () => void;
  onSelect: (userId: number, label: string) => void;
  excludeId?: number;
};

type CreateMethod = "name" | "pin" | "passport";

const ROLE_LABELS: Record<string, string> = {
  admin: "Administrator",
  moderator: "Moderator",
  doctorant: "Doktorant",
  supervisor: "Ilmiy rahbar",
  employee: "Xodim",
};

export function AuthorSelectModal({
  open,
  onClose,
  onSelect,
  excludeId,
}: AuthorSelectModalProps) {
  const { t } = useI18n();
  const [tab, setTab] = useState<"select" | "create">("select");
  const [search, setSearch] = useState("");
  const [method, setMethod] = useState<CreateMethod>("name");
  const [creating, setCreating] = useState(false);
  const [fetching, setFetching] = useState(false);

  // Form holatlari
  const [nameForm, setNameForm] = useState({ last_name: "", first_name: "", middle_name: "" });
  const [pinForm, setPinForm] = useState({ pin: "" });
  const [passportForm, setPassportForm] = useState({
    series: "",
    number: "",
    birth_date: "",
  });
  const [fetchedInfo, setFetchedInfo] = useState<{ full_name: string; gender: string; birth_date: string } | null>(null);

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["users-lookup"],
    queryFn: () => api.fetchUserLookup(),
    enabled: open,
  });

  const filtered = users.filter((u) => {
    if (excludeId && u.id === excludeId) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return u.username.toLowerCase().includes(q);
  });

  const handleSelect = (user: UserLookup) => {
    onSelect(user.id, user.username);
    onClose();
  };

  const handleFetchByPin = async () => {
    if (!pinForm.pin || pinForm.pin.length !== 14) {
      toast.error("JSHSHIR 14 raqamdan iborat bo'lishi kerak");
      return;
    }
    setFetching(true);
    try {
      // Tashqi API integratsiya (hozircha stub)
      await new Promise((r) => setTimeout(r, 800));
      setFetchedInfo({
        full_name: "API dan ma'lumot olish...",
        gender: "male",
        birth_date: "1990-01-01",
      });
      toast.info("API integratsiyasi tez orada qo'shiladi");
    } finally {
      setFetching(false);
    }
  };

  const handleFetchByPassport = async () => {
    if (!passportForm.series || !passportForm.number || !passportForm.birth_date) {
      toast.error("Barcha pasport maydonlarini to'ldiring");
      return;
    }
    setFetching(true);
    try {
      await new Promise((r) => setTimeout(r, 800));
      setFetchedInfo({
        full_name: "API dan ma'lumot olish...",
        gender: "male",
        birth_date: passportForm.birth_date,
      });
      toast.info("API integratsiyasi tez orada qo'shiladi");
    } finally {
      setFetching(false);
    }
  };

  const handleCreateByName = async () => {
    if (!nameForm.last_name || !nameForm.first_name) {
      toast.error("Familiya va ism kiritilishi shart");
      return;
    }
    setCreating(true);
    try {
      const username = `${nameForm.last_name.toLowerCase()}.${nameForm.first_name.toLowerCase()}`;
      const user = await api.createUser({
        username,
        email: `${username}@registry.uz`,
        password: "user12345",
        role_name: "doctorant",
      });
      const label = `${nameForm.last_name} ${nameForm.first_name}`;
      toast.success("Foydalanuvchi yaratildi");
      onSelect(user.id, label);
      onClose();
    } catch (e: unknown) {
      const err = e as Error;
      toast.error(err.message);
    } finally {
      setCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-base font-medium">{t("author.select")}</DialogTitle>
        </DialogHeader>

        <Tabs value={tab} onValueChange={(v) => setTab(v as "select" | "create")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="select" className="text-xs">
              <User className="mr-1.5 h-3.5 w-3.5" />
              Tizimdan tanlash
            </TabsTrigger>
            <TabsTrigger value="create" className="text-xs">
              <UserPlus className="mr-1.5 h-3.5 w-3.5" />
              {t("author.createNew")}
            </TabsTrigger>
          </TabsList>

          {/* Mavjud foydalanuvchi tanlash */}
          <TabsContent value="select" className="space-y-3 mt-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Foydalanuvchi qidirish..."
                className="pl-8 h-8 text-sm"
              />
            </div>

            <div className="max-h-56 overflow-y-auto rounded-md border border-border/60">
              {isLoading ? (
                <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("common.loading")}
                </div>
              ) : filtered.length === 0 ? (
                <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
                  {t("common.noData")}
                </div>
              ) : (
                filtered.map((user) => (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => handleSelect(user)}
                    className="flex w-full items-center justify-between px-3 py-2.5 text-sm hover:bg-accent transition-colors border-b border-border/40 last:border-0"
                  >
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                        {user.username[0]?.toUpperCase()}
                      </div>
                      <span className="font-medium">{user.username}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {ROLE_LABELS[user.role_name] || user.role_name}
                    </span>
                  </button>
                ))
              )}
            </div>
          </TabsContent>

          {/* Yangi foydalanuvchi yaratish */}
          <TabsContent value="create" className="space-y-3 mt-3">
            {/* Usul tanlash */}
            <div className="flex gap-1.5">
              {(["name", "pin", "passport"] as CreateMethod[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMethod(m)}
                  className={`flex-1 rounded-md border px-2 py-1.5 text-xs transition-colors ${
                    method === m
                      ? "border-primary bg-primary/10 text-primary font-medium"
                      : "border-border/60 hover:bg-muted/50"
                  }`}
                >
                  {m === "name" && t("author.byName")}
                  {m === "pin" && t("author.byPin")}
                  {m === "passport" && "Pasport"}
                </button>
              ))}
            </div>

            {/* To'liq ism */}
            {method === "name" && (
              <div className="space-y-2">
                <div className="space-y-1">
                  <Label className="text-xs">{t("author.lastName")} *</Label>
                  <Input
                    value={nameForm.last_name}
                    onChange={(e) => setNameForm((p) => ({ ...p, last_name: e.target.value }))}
                    placeholder="Karimov"
                    className="h-8 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">{t("author.firstName")} *</Label>
                  <Input
                    value={nameForm.first_name}
                    onChange={(e) => setNameForm((p) => ({ ...p, first_name: e.target.value }))}
                    placeholder="Abdulloh"
                    className="h-8 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">{t("author.middleName")}</Label>
                  <Input
                    value={nameForm.middle_name}
                    onChange={(e) => setNameForm((p) => ({ ...p, middle_name: e.target.value }))}
                    placeholder="Aliyevich"
                    className="h-8 text-sm"
                  />
                </div>
                <Button
                  size="sm"
                  className="w-full"
                  onClick={handleCreateByName}
                  disabled={creating}
                >
                  {creating ? (
                    <><Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> Yaratilmoqda...</>
                  ) : (
                    "Yaratish"
                  )}
                </Button>
              </div>
            )}

            {/* JSHSHIR */}
            {method === "pin" && (
              <div className="space-y-2">
                <div className="space-y-1">
                  <Label className="text-xs">{t("author.pin")}</Label>
                  <Input
                    value={pinForm.pin}
                    onChange={(e) => setPinForm({ pin: e.target.value.replace(/\D/g, "").slice(0, 14) })}
                    placeholder="12345678901234"
                    maxLength={14}
                    className="h-8 font-mono text-sm"
                  />
                </div>
                {fetchedInfo && (
                  <div className="flex items-start gap-2 rounded-md border border-green-200 bg-green-50 p-2.5 text-xs dark:border-green-900 dark:bg-green-950">
                    <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-green-600" />
                    <div>
                      <p className="font-medium">{fetchedInfo.full_name}</p>
                      <p className="text-muted-foreground">{fetchedInfo.birth_date}</p>
                    </div>
                  </div>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full"
                  onClick={handleFetchByPin}
                  disabled={fetching}
                >
                  {fetching ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : null}
                  {t("author.fetchInfo")}
                </Button>
              </div>
            )}

            {/* Pasport */}
            {method === "passport" && (
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs">{t("author.passportSeries")}</Label>
                    <Input
                      value={passportForm.series}
                      onChange={(e) => setPassportForm((p) => ({ ...p, series: e.target.value.toUpperCase().replace(/[^A-Z]/g, "").slice(0, 2) }))}
                      placeholder="AA"
                      maxLength={2}
                      className="h-8 font-mono text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">{t("author.passportNumber")}</Label>
                    <Input
                      value={passportForm.number}
                      onChange={(e) => setPassportForm((p) => ({ ...p, number: e.target.value.replace(/\D/g, "").slice(0, 7) }))}
                      placeholder="1234567"
                      maxLength={7}
                      className="h-8 font-mono text-sm"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">{t("author.birthDate")}</Label>
                  <Input
                    type="date"
                    value={passportForm.birth_date}
                    onChange={(e) => setPassportForm((p) => ({ ...p, birth_date: e.target.value }))}
                    className="h-8 text-sm"
                  />
                </div>
                {fetchedInfo && (
                  <div className="flex items-start gap-2 rounded-md border border-green-200 bg-green-50 p-2.5 text-xs dark:border-green-900 dark:bg-green-950">
                    <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-green-600" />
                    <p className="font-medium">{fetchedInfo.full_name}</p>
                  </div>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full"
                  onClick={handleFetchByPassport}
                  disabled={fetching}
                >
                  {fetching ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : null}
                  {t("author.fetchInfo")}
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
