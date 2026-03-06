import { useMutation } from "@tanstack/react-query";
import { Link2, SendHorizontal, Sparkles } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";

import { askAI } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const prompts = [
  "Qaysi ishlar amaliyotga tezroq joriy qilinishi mumkin?",
  "Huquqiy tartibga solishdagi asosiy muammolarni guruhlab ber.",
  "Approved statusdagi ishlar ichidan eng dolzarb takliflarni ko'rsat.",
];

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  references?: Array<{ id: string; source: Record<string, string> }>;
};

export default function AIAssistantChat() {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);

  const mutation = useMutation({
    mutationFn: async (text: string) => askAI(text, 5),
    onSuccess: (data, text) => {
      setMessages((prev) => [
        ...prev,
        { id: `u-${Date.now()}`, role: "user", content: text },
        {
          id: `a-${Date.now()}`,
          role: "assistant",
          content: data.answer,
          references: data.references,
        },
      ]);
      setQuestion("");
    },
  });

  const submitting = mutation.isPending;

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const text = question.trim();
    if (!text || submitting) {
      return;
    }
    await mutation.mutateAsync(text);
  };

  const emptyHint = useMemo(
    () => (
      <div className="rounded-lg border border-dashed border-border/80 p-4 text-sm text-muted-foreground">
        Savol bering, AI dissertatsiya bazasi kontekstida javob va referenslar qaytaradi.
      </div>
    ),
    [],
  );

  return (
    <Card className="animate-slide-up">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Sparkles className="h-4 w-4" /> AI Assistant
        </CardTitle>
        <CardDescription>ChatGPT-style dialog: messages, prompts, references.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid gap-2 rounded-lg border border-border/60 bg-white/40 p-3 dark:bg-slate-900/30">
          {messages.length === 0 && emptyHint}
          {messages.map((message) => (
            <div
              key={message.id}
              className={
                message.role === "user"
                  ? "ml-auto max-w-[85%] rounded-xl bg-primary px-3 py-2 text-sm text-primary-foreground"
                  : "mr-auto max-w-[90%] rounded-xl bg-secondary px-3 py-2 text-sm"
              }
            >
              <p className="whitespace-pre-wrap">{message.content}</p>
              {message.references && message.references.length > 0 && (
                <div className="mt-2 space-y-1 border-t border-border/40 pt-2">
                  {message.references.slice(0, 3).map((ref) => (
                    <a
                      key={ref.id}
                      className="flex items-center gap-1 text-xs text-primary hover:underline"
                      href={`/dashboard/dissertations#${ref.id}`}
                    >
                      <Link2 className="h-3.5 w-3.5" />
                      {ref.source.title || `Reference #${ref.id}`}
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          {prompts.map((prompt) => (
            <Button key={prompt} variant="outline" size="sm" onClick={() => setQuestion(prompt)}>
              {prompt}
            </Button>
          ))}
        </div>

        <form className="flex gap-2" onSubmit={onSubmit}>
          <Input value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="Savolingizni kiriting..." />
          <Button type="submit" disabled={submitting}>
            <SendHorizontal className="mr-2 h-4 w-4" />
            {submitting ? "Processing" : "Send"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
