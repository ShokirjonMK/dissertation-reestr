import { Bot, ChartNoAxesCombined, FileUp, Rocket, UserRoundCheck } from "lucide-react";
import { useRouter } from "next/router";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Notification } from "@/components/ui/notification";

export default function RightWidgets() {
  const router = useRouter();

  return (
    <div className="space-y-4">
      <Card className="animate-blur-in">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Bot className="h-4 w-4" /> AI Research Assistant
          </CardTitle>
          <CardDescription>Context-based analysis and recommendation engine for dissertation proposals.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button className="w-full" onClick={() => toast.success("AI analysis session opened")}>
            <Rocket className="mr-2 h-4 w-4" />
            Start Analysis
          </Button>
        </CardContent>
      </Card>

      <Card className="animate-blur-in">
        <CardHeader>
          <CardTitle className="text-base">Quick Actions</CardTitle>
          <CardDescription>Fast access to key workflows.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-2">
          <Button
            variant="secondary"
            className="justify-start"
            onClick={() => {
              void router.push("/dashboard/dissertations/new");
            }}
          >
            <FileUp className="mr-2 h-4 w-4" /> Submit Proposal
          </Button>
          <Button variant="secondary" className="justify-start" onClick={() => toast("Analytics opened")}>
            <ChartNoAxesCombined className="mr-2 h-4 w-4" /> Review Analytics
          </Button>
          <Button variant="secondary" className="justify-start" onClick={() => toast("Supervisor portal opened")}>
            <UserRoundCheck className="mr-2 h-4 w-4" /> Supervisor Portal
          </Button>
        </CardContent>
      </Card>

      <Notification
        type="info"
        title="Internal access"
        description="Asosiy tizim faqat avtorizatsiya qilingan foydalanuvchilar uchun ochiq."
      />
    </div>
  );
}
