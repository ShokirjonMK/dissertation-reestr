import Head from "next/head";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function LandingPage() {
  return (
    <>
      <Head>
        <title>Dissertation Registry</title>
      </Head>
      <div className="grid min-h-screen place-items-center p-4">
        <Card className="w-full max-w-4xl animate-blur-in">
          <CardContent className="space-y-6 p-8">
            <h1 className="word-reveal text-4xl font-medium tracking-tight sm:text-5xl">
              <span>Dissertation</span> <span>Problems</span> <span>&</span> <span>Proposals Registry</span>
            </h1>
            <p className="max-w-3xl text-base text-muted-foreground">
              Markazlashgan reestr: doktorantlar tomonidan kiritilgan muammo va takliflar, ekspertlar ko&apos;rib chiqishi,
              AI yordamida kontekstli tahlil va amaliyotga joriy qilish tavsiyalari.
            </p>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-border/70 bg-white/40 p-3 dark:bg-slate-900/35">
                <p className="text-xs text-muted-foreground">Maqsad</p>
                <p className="text-sm">Ilmiy ish natijalarini yagona platformada boshqarish</p>
              </div>
              <div className="rounded-lg border border-border/70 bg-white/40 p-3 dark:bg-slate-900/35">
                <p className="text-xs text-muted-foreground">Qamrov</p>
                <p className="text-sm">Dissertatsiya, muammo, taklif, xulosa, qidiruv, AI</p>
              </div>
              <div className="rounded-lg border border-border/70 bg-white/40 p-3 dark:bg-slate-900/35">
                <p className="text-xs text-muted-foreground">Aloqa</p>
                <p className="text-sm">support@registry.local</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button asChild>
                <Link href="/login">Tizimga kirish</Link>
              </Button>
              <Button asChild variant="outline">
                <a href="mailto:support@registry.local">Bog&apos;lanish</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
