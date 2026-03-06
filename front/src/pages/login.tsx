import Head from "next/head";
import { useRouter } from "next/router";
import { useMutation } from "@tanstack/react-query";
import { LogIn } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";

import { fetchMe, login } from "@/services/api";
import { useAuthStore } from "@/store/auth-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const router = useRouter();
  const token = useAuthStore((state) => state.token);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const setToken = useAuthStore((state) => state.setToken);
  const setUser = useAuthStore((state) => state.setUser);

  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("admin12345");

  useEffect(() => {
    if (hasHydrated && token) {
      void router.replace("/dashboard");
    }
  }, [hasHydrated, router, token]);

  const mutation = useMutation({
    mutationFn: async () => {
      const result = await login(username, password);
      setToken(result.access_token);
      const me = await fetchMe();
      setUser(me);
    },
    onSuccess: () => {
      toast.success("Muvaffaqiyatli kirildi");
      void router.replace("/dashboard");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Kirishda xatolik");
    },
  });

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!hasHydrated || mutation.isPending) {
      return;
    }
    await mutation.mutateAsync();
  };

  return (
    <>
      <Head>
        <title>Login | Dissertation Registry</title>
      </Head>
      <div className="grid min-h-screen place-items-center p-4">
        <Card className="w-full max-w-md animate-slide-up">
          <CardHeader>
            <CardTitle className="text-2xl font-medium">Kirish</CardTitle>
            <CardDescription>OneID bosqichma-bosqich qo&apos;shiladi, hozir login/parol aktiv.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-3" onSubmit={onSubmit}>
              <div>
                <label className="mb-1 block text-sm">Login</label>
                <Input value={username} onChange={(e) => setUsername(e.target.value)} required />
              </div>
              <div>
                <label className="mb-1 block text-sm">Parol</label>
                <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
              <Button className="w-full" type="submit" disabled={mutation.isPending || !hasHydrated}>
                <LogIn className="mr-2 h-4 w-4" />
                {!hasHydrated ? "Session tekshirilmoqda..." : mutation.isPending ? "Kutilmoqda..." : "Kirish"}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => toast.info("OneID callback API orqali tayyor")}
              >
                OneID (staged)
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
