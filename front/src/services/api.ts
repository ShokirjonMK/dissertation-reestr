import { useAuthStore } from "@/store/auth-store";
import type {
  CatalogItem,
  Dissertation,
  DissertationDetail,
  DissertationFileKind,
  SearchQueryParams,
  User,
  UserCreatePayload,
  UserLookup,
  UserUpdatePayload,
} from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  auth?: boolean;
};

function buildAuthHeaders(auth = true): HeadersInit {
  const token = useAuthStore.getState().token;
  if (!auth || !token) {
    return {};
  }
  return { Authorization: `Bearer ${token}` };
}

async function parseError(response: Response): Promise<Error> {
  const text = await response.text();
  try {
    const payload = JSON.parse(text) as { detail?: string };
    return new Error(payload.detail || `Request failed (${response.status})`);
  } catch {
    return new Error(text || `Request failed (${response.status})`);
  }
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...buildAuthHeaders(options.auth !== false),
  };

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method || "GET",
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!response.ok) {
    throw await parseError(response);
  }

  return (await response.json()) as T;
}

export async function login(username: string, password: string) {
  return request<{ access_token: string; token_type: string }>("/auth/login", {
    method: "POST",
    auth: false,
    body: { username, password },
  });
}

export async function fetchMe() {
  return request<User>("/auth/me");
}

export async function fetchDissertations(filters: SearchQueryParams = {}) {
  const query = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && String(value) !== "") {
      query.set(key, String(value));
    }
  });

  const suffix = query.toString();
  return request<Dissertation[]>(`/dissertations/${suffix ? `?${suffix}` : ""}`);
}

export async function fetchDissertation(dissertationId: number) {
  return request<DissertationDetail>(`/dissertations/${dissertationId}`);
}

export async function createDissertation(formData: FormData) {
  const response = await fetch(`${API_BASE_URL}/dissertations/submit`, {
    method: "POST",
    headers: buildAuthHeaders(true),
    body: formData,
  });

  if (!response.ok) {
    throw await parseError(response);
  }

  return (await response.json()) as DissertationDetail;
}

export async function fetchDissertationFile(dissertationId: number, fileKind: DissertationFileKind) {
  const response = await fetch(`${API_BASE_URL}/dissertations/${dissertationId}/files/${fileKind}`, {
    method: "GET",
    headers: buildAuthHeaders(true),
  });

  if (!response.ok) {
    throw await parseError(response);
  }

  const disposition = response.headers.get("content-disposition") || "";
  const matched = disposition.match(/filename=\"?([^\";]+)\"?/i);
  const filename = matched?.[1] || `dissertation_${dissertationId}_${fileKind}`;
  const blob = await response.blob();
  return { filename, blob };
}

export async function fetchCatalog(path: "scientific-directions" | "universities" | "regions" | "districts") {
  return request<CatalogItem[]>(`/catalogs/${path}`);
}

// ─── Ko'p tilli katalog API ───────────────────────────────────────────────────

export async function fetchCountries() {
  return request<import("@/types").Country[]>("/catalogs/countries");
}
export async function createCountry(payload: import("@/types").CountryPayload) {
  return request<import("@/types").Country>("/catalogs/countries", { method: "POST", body: payload });
}
export async function updateCountry(id: number, payload: import("@/types").CountryPayload) {
  return request<import("@/types").Country>(`/catalogs/countries/${id}`, { method: "PUT", body: payload });
}
export async function deleteCountry(id: number) {
  return request<{ deleted: boolean }>(`/catalogs/countries/${id}`, { method: "DELETE" });
}

export async function fetchScientificDirections() {
  return request<import("@/types").ScientificDirection[]>("/catalogs/scientific-directions");
}
export async function createScientificDirection(payload: import("@/types").ScientificDirectionPayload) {
  return request<import("@/types").ScientificDirection>("/catalogs/scientific-directions", { method: "POST", body: payload });
}
export async function updateScientificDirection(id: number, payload: import("@/types").ScientificDirectionPayload) {
  return request<import("@/types").ScientificDirection>(`/catalogs/scientific-directions/${id}`, { method: "PUT", body: payload });
}
export async function deleteScientificDirection(id: number) {
  return request<{ deleted: boolean }>(`/catalogs/scientific-directions/${id}`, { method: "DELETE" });
}

export async function fetchUniversities() {
  return request<import("@/types").University[]>("/catalogs/universities");
}
export async function createUniversity(payload: import("@/types").UniversityPayload) {
  return request<import("@/types").University>("/catalogs/universities", { method: "POST", body: payload });
}
export async function updateUniversity(id: number, payload: import("@/types").UniversityPayload) {
  return request<import("@/types").University>(`/catalogs/universities/${id}`, { method: "PUT", body: payload });
}
export async function deleteUniversity(id: number) {
  return request<{ deleted: boolean }>(`/catalogs/universities/${id}`, { method: "DELETE" });
}

export async function fetchRegions() {
  return request<import("@/types").Region[]>("/catalogs/regions");
}
export async function createRegion(payload: import("@/types").RegionPayload) {
  return request<import("@/types").Region>("/catalogs/regions", { method: "POST", body: payload });
}
export async function updateRegion(id: number, payload: import("@/types").RegionPayload) {
  return request<import("@/types").Region>(`/catalogs/regions/${id}`, { method: "PUT", body: payload });
}
export async function deleteRegion(id: number) {
  return request<{ deleted: boolean }>(`/catalogs/regions/${id}`, { method: "DELETE" });
}

export async function fetchDistricts() {
  return request<import("@/types").District[]>("/catalogs/districts");
}
export async function createDistrict(payload: import("@/types").DistrictPayload) {
  return request<import("@/types").District>("/catalogs/districts", { method: "POST", body: payload });
}
export async function updateDistrict(id: number, payload: import("@/types").DistrictPayload) {
  return request<import("@/types").District>(`/catalogs/districts/${id}`, { method: "PUT", body: payload });
}
export async function deleteDistrict(id: number) {
  return request<{ deleted: boolean }>(`/catalogs/districts/${id}`, { method: "DELETE" });
}

export async function fetchUserLookup(role?: string) {
  const suffix = role ? `?role=${encodeURIComponent(role)}` : "";
  return request<UserLookup[]>(`/users/lookup${suffix}`);
}

export async function fetchUsers() {
  return request<User[]>("/users/");
}

export async function createUser(payload: UserCreatePayload) {
  return request<User>("/users/", { method: "POST", body: payload });
}

export async function updateUser(userId: number, payload: UserUpdatePayload) {
  return request<User>(`/users/${userId}`, { method: "PUT", body: payload });
}

export async function deleteUser(userId: number) {
  return request<{ deleted: boolean }>(`/users/${userId}`, { method: "DELETE" });
}

export async function askAI(question: string, topK = 5) {
  return request<{ answer: string; references: Array<{ id: string; source: Record<string, string> }> }>("/ai/ask", {
    method: "POST",
    body: { question, top_k: topK },
  });
}
