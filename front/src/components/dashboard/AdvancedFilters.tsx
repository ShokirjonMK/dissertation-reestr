import { FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useFiltersStore } from "@/store/filters-store";
import type { CatalogItem } from "@/types";

type Props = {
  directions: CatalogItem[];
  universities: CatalogItem[];
  regions: CatalogItem[];
  onApply: () => void;
};

export default function AdvancedFilters({ directions, universities, regions, onApply }: Props) {
  const { filters, setFilter, resetFilters } = useFiltersStore();

  const apply = (event: FormEvent) => {
    event.preventDefault();
    onApply();
  };

  return (
    <Card className="animate-slide-up">
      <CardHeader>
        <CardTitle className="text-base">Advanced Filters</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={apply}>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
            <Input placeholder="Keyword search" value={filters.query} onChange={(e) => setFilter("query", e.target.value)} />
            <Input placeholder="Title" value={filters.title} onChange={(e) => setFilter("title", e.target.value)} />
            <Input placeholder="Problem" value={filters.problem} onChange={(e) => setFilter("problem", e.target.value)} />
            <Input placeholder="Proposal" value={filters.proposal} onChange={(e) => setFilter("proposal", e.target.value)} />
            <Input placeholder="Annotation" value={filters.annotation} onChange={(e) => setFilter("annotation", e.target.value)} />
            <Input placeholder="Conclusion" value={filters.conclusion} onChange={(e) => setFilter("conclusion", e.target.value)} />
            <Input placeholder="Keywords (tag1,tag2)" value={filters.keywords} onChange={(e) => setFilter("keywords", e.target.value)} />
            <Input placeholder="Author" value={filters.author} onChange={(e) => setFilter("author", e.target.value)} />
            <Input placeholder="Supervisor" value={filters.supervisor} onChange={(e) => setFilter("supervisor", e.target.value)} />

            <Select value={String(filters.scientific_direction_id || "all")} onValueChange={(value) => setFilter("scientific_direction_id", value === "all" ? "" : value)}>
              <SelectTrigger>
                <SelectValue placeholder="Scientific direction" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Scientific direction</SelectItem>
                {directions.map((item) => (
                  <SelectItem key={item.id} value={String(item.id)}>
                    {item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={String(filters.university_id || "all")} onValueChange={(value) => setFilter("university_id", value === "all" ? "" : value)}>
              <SelectTrigger>
                <SelectValue placeholder="University" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">University</SelectItem>
                {universities.map((item) => (
                  <SelectItem key={item.id} value={String(item.id)}>
                    {item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={String(filters.region_id || "all")} onValueChange={(value) => setFilter("region_id", value === "all" ? "" : value)}>
              <SelectTrigger>
                <SelectValue placeholder="Region selector" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Region selector</SelectItem>
                {regions.map((item) => (
                  <SelectItem key={item.id} value={String(item.id)}>
                    {item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={String(filters.status || "all")} onValueChange={(value) => setFilter("status", value === "all" ? "" : value)}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="pending">Under Review</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="defended">Defended</SelectItem>
              </SelectContent>
            </Select>

            <Select value={String(filters.category || "all")} onValueChange={(value) => setFilter("category", value === "all" ? "" : value)}>
              <SelectTrigger>
                <SelectValue placeholder="Registry category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Registry category</SelectItem>
                <SelectItem value="constitutional">Constitutional</SelectItem>
                <SelectItem value="civil">Civil law</SelectItem>
                <SelectItem value="criminal">Criminal law</SelectItem>
                <SelectItem value="administrative">Administrative</SelectItem>
              </SelectContent>
            </Select>

            <div className="rounded-lg border border-input bg-white/50 p-2 text-sm dark:bg-slate-900/35">
              <label className="mb-1 block text-xs text-muted-foreground">Expert rating slider: {filters.expert_rating_min || 0}+</label>
              <input
                className="w-full"
                type="range"
                min={0}
                max={100}
                step={5}
                value={Number(filters.expert_rating_min || 0)}
                onChange={(e) => setFilter("expert_rating_min", Number(e.target.value))}
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border border-input bg-white/50 p-3 text-sm dark:bg-slate-900/35">
              <span>Visibility toggle (public)</span>
              <Switch
                checked={filters.visibility === "public"}
                onCheckedChange={(checked) => setFilter("visibility", checked ? "public" : "internal")}
              />
            </div>

            <div className="flex items-center gap-2 rounded-lg border border-input bg-white/50 p-3 text-sm dark:bg-slate-900/35">
              <Checkbox
                checked={Boolean(filters.query && String(filters.query).length > 0)}
                onCheckedChange={(checked) => {
                  if (!checked) {
                    setFilter("query", "");
                  }
                }}
              />
              <span>Use keyword query in combination</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button type="submit">Apply Parameters</Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                resetFilters();
                onApply();
              }}
            >
              Reset
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
