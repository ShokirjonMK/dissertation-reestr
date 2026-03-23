"use client";

import { useQuery } from "@tanstack/react-query";
import { ChevronDown, ChevronUp, Plus, Sparkles, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  API_BASE_URL,
  buildAuthHeaders,
  fetchDissertationProblems,
  fetchDissertationProposalContents,
} from "@/services/api";
import type { ProblemItem, ProposalItem } from "@/types/implementation-proposal";

interface Props {
  dissertationId: number;
  initialProblems?: ProblemItem[];
  initialProposals?: ProposalItem[];
  onSave?: (problems: ProblemItem[], proposals: ProposalItem[]) => void;
}

export function ProblemsProposalsEditor({
  dissertationId,
  initialProblems = [],
  initialProposals = [],
  onSave,
}: Props) {
  const [problems, setProblems] = useState<ProblemItem[]>(initialProblems);
  const [proposals, setProposals] = useState<ProposalItem[]>(initialProposals);
  const [showPages, setShowPages] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [saving, setSaving] = useState(false);

  const problemsQuery = useQuery({
    queryKey: ["dissertation-problems", dissertationId],
    queryFn: () => fetchDissertationProblems(dissertationId),
    enabled: Number.isFinite(dissertationId),
  });

  const proposalsQuery = useQuery({
    queryKey: ["dissertation-proposal-contents", dissertationId],
    queryFn: () => fetchDissertationProposalContents(dissertationId),
    enabled: Number.isFinite(dissertationId),
  });

  useEffect(() => {
    if (initialProblems.length || initialProposals.length) {
      return;
    }
    if (problemsQuery.data) {
      setProblems(
        problemsQuery.data.map((p) => ({
          id: p.id,
          order_num: p.order_num,
          problem_text: p.problem_text,
          source_page: p.source_page ?? undefined,
        })),
      );
    }
    if (proposalsQuery.data) {
      setProposals(
        proposalsQuery.data.map((p) => ({
          id: p.id,
          order_num: p.order_num,
          proposal_text: p.proposal_text,
          source_page: p.source_page ?? undefined,
        })),
      );
    }
  }, [initialProblems.length, initialProposals.length, problemsQuery.data, proposalsQuery.data]);

  const addProblem = () => setProblems((p) => [...p, { order_num: p.length + 1, problem_text: "" }]);
  const addProposal = () => setProposals((p) => [...p, { order_num: p.length + 1, proposal_text: "" }]);

  const updateProblem = (idx: number, text: string) =>
    setProblems((p) => p.map((item, i) => (i === idx ? { ...item, problem_text: text } : item)));
  const updateProposal = (idx: number, text: string) =>
    setProposals((p) => p.map((item, i) => (i === idx ? { ...item, proposal_text: text } : item)));
  const updateProblemPage = (idx: number, page: string) =>
    setProblems((p) => p.map((item, i) => (i === idx ? { ...item, source_page: page } : item)));
  const updateProposalPage = (idx: number, page: string) =>
    setProposals((p) => p.map((item, i) => (i === idx ? { ...item, source_page: page } : item)));

  const removeProblem = (idx: number) =>
    setProblems((p) =>
      p
        .filter((_, i) => i !== idx)
        .map((item, i) => ({ ...item, order_num: i + 1 })),
    );
  const removeProposal = (idx: number) =>
    setProposals((p) =>
      p
        .filter((_, i) => i !== idx)
        .map((item, i) => ({ ...item, order_num: i + 1 })),
    );

  const handleExtract = async (file: File) => {
    setExtracting(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch(
        `${API_BASE_URL}/dissertations/${dissertationId}/extract-problems-proposals`,
        {
          method: "POST",
          headers: buildAuthHeaders(true),
          body: formData,
        },
      );
      const data = (await res.json()) as {
        problems?: { order: number; problem_text: string; source_page?: string }[];
        proposals?: { order: number; proposal_text: string; source_page?: string }[];
        error?: string;
      };
      if (!res.ok) {
        throw new Error((data as { detail?: string }).detail || "Ajratishda xato");
      }
      if (data.error) {
        toast.message(data.error);
      }
      if (data.problems) {
        setProblems(
          data.problems.map((p, i) => ({
            order_num: p.order ?? i + 1,
            problem_text: p.problem_text,
            source_page: p.source_page,
          })),
        );
      }
      if (data.proposals) {
        setProposals(
          data.proposals.map((p, i) => ({
            order_num: p.order ?? i + 1,
            proposal_text: p.proposal_text,
            source_page: p.source_page,
          })),
        );
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Ajratishda xato");
    } finally {
      setExtracting(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const headers: HeadersInit = {
        "Content-Type": "application/json",
        ...buildAuthHeaders(true),
      };
      const pr = await fetch(`${API_BASE_URL}/dissertations/${dissertationId}/problems/bulk`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          problems: problems.filter((p) => p.problem_text.trim()).map((p) => ({
            problem_text: p.problem_text,
            source_page: p.source_page,
            order_num: p.order_num,
          })),
          replace_existing: true,
        }),
      });
      if (!pr.ok) {
        throw new Error("Muammolarni saqlashda xato");
      }
      const pr2 = await fetch(`${API_BASE_URL}/dissertations/${dissertationId}/proposal-contents/bulk`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          proposals: proposals.filter((p) => p.proposal_text.trim()).map((p) => ({
            proposal_text: p.proposal_text,
            source_page: p.source_page,
            order_num: p.order_num,
          })),
          replace_existing: true,
        }),
      });
      if (!pr2.ok) {
        throw new Error("Takliflarni saqlashda xato");
      }
      toast.success("Saqlandi");
      onSave?.(problems, proposals);
      void problemsQuery.refetch();
      void proposalsQuery.refetch();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Saqlashda xato");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 rounded-lg border border-blue-200 bg-blue-50/80 p-4 dark:border-blue-900/40 dark:bg-blue-950/30">
        <Sparkles className="size-5 shrink-0 text-blue-500" />
        <div className="flex-1 text-sm text-blue-800 dark:text-blue-200">
          PDF yoki Word yuklasangiz, AI yordamida muammo va takliflar ajratiladi.
        </div>
        <label className="inline-flex cursor-pointer items-center rounded-md border border-input bg-background px-3 py-1.5 text-sm font-medium shadow-sm hover:bg-accent">
          <input
            type="file"
            accept=".pdf,.docx,.doc"
            className="sr-only"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void handleExtract(f);
              e.target.value = "";
            }}
          />
          {extracting ? "Ajratyapti..." : "Fayl yuklash"}
        </label>
      </div>

      <button
        type="button"
        onClick={() => setShowPages((s) => !s)}
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        {showPages ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        Sahifalarni {showPages ? "yashirish" : "ko'rsatish"}
      </button>

      <div>
        <h3 className="mb-3 flex items-center gap-2 font-semibold text-foreground">
          <span className="inline-block size-3 rounded-full bg-red-500" />
          Muammolar
        </h3>
        <div className="space-y-2">
          {problems.map((item, idx) => (
            <div key={`${idx}-${item.order_num}`} className="flex items-start gap-2">
              <span className="mt-2.5 w-6 shrink-0 text-sm text-muted-foreground">{idx + 1}.</span>
              <div className="flex-1 space-y-1">
                <Textarea
                  value={item.problem_text}
                  onChange={(e) => updateProblem(idx, e.target.value)}
                  placeholder="Muammo matnini kiriting..."
                  className="min-h-[80px] resize-none"
                />
                {showPages && (
                  <Input
                    value={item.source_page || ""}
                    onChange={(e) => updateProblemPage(idx, e.target.value)}
                    placeholder="Sahifa (masalan: 45)"
                    className="h-8 text-sm"
                  />
                )}
              </div>
              <button
                type="button"
                onClick={() => removeProblem(idx)}
                className="mt-2.5 text-muted-foreground transition-colors hover:text-destructive"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addProblem}
            className="mt-1 flex items-center gap-1 text-sm text-primary hover:underline"
          >
            <Plus size={14} /> Muammo qo&apos;shish
          </button>
        </div>
      </div>

      <div>
        <h3 className="mb-3 flex items-center gap-2 font-semibold text-foreground">
          <span className="inline-block size-3 rounded-full bg-green-500" />
          Takliflar
        </h3>
        <div className="space-y-2">
          {proposals.map((item, idx) => (
            <div key={`${idx}-${item.order_num}`} className="flex items-start gap-2">
              <span className="mt-2.5 w-6 shrink-0 text-sm text-muted-foreground">{idx + 1}.</span>
              <div className="flex-1 space-y-1">
                <Textarea
                  value={item.proposal_text}
                  onChange={(e) => updateProposal(idx, e.target.value)}
                  placeholder="Taklif matnini kiriting..."
                  className="min-h-[80px] resize-none"
                />
                {showPages && (
                  <Input
                    value={item.source_page || ""}
                    onChange={(e) => updateProposalPage(idx, e.target.value)}
                    placeholder="Sahifa (masalan: 89)"
                    className="h-8 text-sm"
                  />
                )}
              </div>
              <button
                type="button"
                onClick={() => removeProposal(idx)}
                className="mt-2.5 text-muted-foreground transition-colors hover:text-destructive"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addProposal}
            className="mt-1 flex items-center gap-1 text-sm text-emerald-600 hover:underline dark:text-emerald-400"
          >
            <Plus size={14} /> Taklif qo&apos;shish
          </button>
        </div>
      </div>

      <Button type="button" onClick={() => void handleSave()} disabled={saving} className="w-full">
        {saving ? "Saqlanmoqda..." : "Saqlash"}
      </Button>
    </div>
  );
}
