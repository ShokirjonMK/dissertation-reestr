import { FormEvent, useEffect, useState } from "react";

import DissertationTable from "@/components/DissertationTable";
import DashboardLayout from "@/layouts/DashboardLayout";
import { fetchCatalog, fetchDissertations, type CatalogItem, type Dissertation } from "@/services/api";
import { getToken } from "@/store/auth";

export default function DissertationsPage() {
  const [items, setItems] = useState<Dissertation[]>([]);
  const [directions, setDirections] = useState<CatalogItem[]>([]);
  const [universities, setUniversities] = useState<CatalogItem[]>([]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [scientificDirectionId, setScientificDirectionId] = useState("");
  const [universityId, setUniversityId] = useState("");

  const load = async () => {
    const data = await fetchDissertations({
      query,
      status,
      scientific_direction_id: scientificDirectionId,
      university_id: universityId,
    });
    setItems(data);
  };

  useEffect(() => {
    if (!getToken()) {
      window.location.href = "/login";
      return;
    }
    load().catch(() => setItems([]));

    Promise.all([fetchCatalog("scientific-directions"), fetchCatalog("universities")])
      .then(([dirs, unis]) => {
        setDirections(dirs);
        setUniversities(unis);
      })
      .catch(() => {
        setDirections([]);
        setUniversities([]);
      });
  }, []);

  const onFilter = async (e: FormEvent) => {
    e.preventDefault();
    await load();
  };

  return (
    <DashboardLayout title="Dissertations">
      <form className="card filters" onSubmit={onFilter}>
        <div className="filter-grid">
          <label>
            Search
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Muammo, taklif, xulosa..." />
          </label>
          <label>
            Status
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">All</option>
              <option value="draft">draft</option>
              <option value="pending">pending</option>
              <option value="approved">approved</option>
              <option value="rejected">rejected</option>
              <option value="defended">defended</option>
            </select>
          </label>
          <label>
            Scientific direction
            <select value={scientificDirectionId} onChange={(e) => setScientificDirectionId(e.target.value)}>
              <option value="">All</option>
              {directions.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            University
            <select value={universityId} onChange={(e) => setUniversityId(e.target.value)}>
              <option value="">All</option>
              {universities.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
        </div>
        <button className="btn" type="submit">
          Filter
        </button>
      </form>

      <DissertationTable items={items} />
    </DashboardLayout>
  );
}
