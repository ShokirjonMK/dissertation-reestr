"use client";

import type { FormEvent } from "react";
import { BookOpen, ChevronDown, ChevronUp, Search } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { SearchResult } from "@/types/implementation-proposal";
import { API_BASE_URL, buildAuthHeaders } from "@/services/api";

export function SimpleProblemSearch() {
  const [query, setQuery] = useState("");
  const [type, setType] = useState<"both" | "problems" | "proposals">("both");
  const [showFilters, setShowFilters] = useState(false);
  const [yearFrom, setYearFrom] = useState("");
  const [yearTo, setYearTo] = useState("");
  const [field, setField] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e?: FormEvent) => {
    e?.preventDefault();
    if (!query.trim()) {
      return;
    }
    setLoading(true);
    setSearched(true);
    try {
      const params = new URLSearchParams({ q: query, type });
      if (yearFrom) params.append("year_from", yearFrom);
      if (yearTo) params.append("year_to", yearTo);
      if (field) params.append("field", field);
      const res = await fetch(`${API_BASE_URL}/search/problems-proposals?${params}`, {
        headers: buildAuthHeaders(true),
      });
      const data = (await res.json()) as { items?: SearchResult[]; total?: number };
      if (!res.ok) {
        setResults([]);
        setTotal(0);
        return;
      }
      setResults(data.items || []);
      setTotal(data.total || 0);
    } catch {
      setResults([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="text-center">
        <h1 className="mb-1 text-2xl font-bold text-foreground">Muammo va takliflar qidiruvi</h1>
        <p className="text-sm text-muted-foreground">Dissertatsiyalardagi muammo va takliflar bo&apos;yicha qidiring</p>
      </div>

      <form
        onSubmit={(e) => void handleSearch(e)}
        className="space-y-4 rounded-2xl border border-border/60 bg-card/80 p-6 shadow-sm backdrop-blur-sm"
      >
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 size-[18px] -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Qidiruv so'zini kiriting..."
              className="h-12 pl-10 text-base"
              autoFocus
            />
          </div>
          <Button type="submit" size="lg" className="px-8" disabled={loading}>
            {loading ? "Qidirmoqda..." : "Qidirish"}
          </Button>
        </div>

        <div className="flex gap-4 text-sm">
          {(
            [
              ["both", "Ikkalasi"],
              ["problems", "Muammolar"],
              ["proposals", "Takliflar"],
            ] as const
          ).map(([val, label]) => (
            <label key={val} className="flex cursor-pointer items-center gap-2">
              <input
                type="radio"
                value={val}
                checked={type === val}
                onChange={() => setType(val)}
                className="text-primary"
              />
              <span className={type === val ? "font-medium text-primary" : "text-muted-foreground"}>{label}</span>
            </label>
          ))}
        </div>

        <div>
          <button
            type="button"
            onClick={() => setShowFilters((s) => !s)}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            {showFilters ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            Qo&apos;shimcha filtrlar
          </button>
          {showFilters && (
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">Yildan</label>
                <Input
                  type="number"
                  value={yearFrom}
                  onChange={(e) => setYearFrom(e.target.value)}
                  placeholder="2015"
                  min={1990}
                  max={2030}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">Yilgacha</label>
                <Input
                  type="number"
                  value={yearTo}
                  onChange={(e) => setYearTo(e.target.value)}
                  placeholder="2026"
                  min={1990}
                  max={2030}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">Ilmiy yo&apos;nalish</label>
                <Input
                  value={field}
                  onChange={(e) => setField(e.target.value)}
                  placeholder="Huquq, iqtisodiyot..."
                />
              </div>
            </div>
          )}
        </div>
      </form>

      {searched && (
        <div>
          <p className="mb-4 text-sm text-muted-foreground">
            {loading ? "Qidirmoqda..." : `${total} ta natija topildi`}
          </p>
          <div className="space-y-4">
            {results.map((result) => (
              <SearchResultCard key={result.id} result={result} />
            ))}
            {!loading && searched && results.length === 0 && (
              <div className="py-12 text-center text-muted-foreground">
                <BookOpen className="mx-auto mb-3 size-10 opacity-50" />
                <p>Natija topilmadi. Boshqa so&apos;z bilan qidiring.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function SearchResultCard({ result }: { result: SearchResult }) {
  return (
    <div className="rounded-xl border border-border/60 bg-card/90 p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-semibold text-foreground">{result.title}</h3>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {result.author} · {result.university}
            {result.year != null ? ` · ${result.year}` : ""}
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-muted px-2 py-1 text-xs text-muted-foreground">
          {result.degree || "—"}
        </span>
      </div>

      {result.matched_problems.length > 0 && (
        <div className="mb-3">
          <p className="mb-1.5 flex items-center gap-1 text-xs font-medium text-red-600">
            <span className="inline-block size-2 rounded-full bg-red-500" /> Muammolar
          </p>
          {result.matched_problems.map((p, i) => (
            <p
              key={i}
              className="mb-1 rounded bg-red-50 px-3 py-2 text-sm text-foreground dark:bg-red-950/40"
              dangerouslySetInnerHTML={{ __html: p.text }}
            />
          ))}
        </div>
      )}

      {result.matched_proposals.length > 0 && (
        <div>
          <p className="mb-1.5 flex items-center gap-1 text-xs font-medium text-emerald-600">
            <span className="inline-block size-2 rounded-full bg-emerald-500" /> Takliflar
          </p>
          {result.matched_proposals.map((p, i) => (
            <p
              key={i}
              className="mb-1 rounded bg-emerald-50 px-3 py-2 text-sm text-foreground dark:bg-emerald-950/40"
              dangerouslySetInnerHTML={{ __html: p.text }}
            />
          ))}
        </div>
      )}

      <div className="mt-3">
        <Link href={`/dashboard/dissertations/${result.id}`} className="text-xs text-primary hover:underline">
          Batafsil →
        </Link>
      </div>
    </div>
  );
}
