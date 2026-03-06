import { getToken } from "@/store/auth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  auth?: boolean;
};

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (options.auth !== false) {
    const token = getToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method || "GET",
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Request failed with status ${res.status}`);
  }

  return (await res.json()) as T;
}

export type LoginResponse = {
  access_token: string;
  token_type: string;
};

export type Dissertation = {
  id: number;
  title: string;
  scientific_direction_id: number;
  university_id: number;
  author_id: number;
  supervisor_id: number | null;
  problem: string;
  proposal: string;
  annotation: string;
  conclusion: string;
  keywords: string[];
  defense_date: string | null;
  status: string;
  created_at: string;
  updated_at: string;
};

export type CatalogItem = {
  id: number;
  name: string;
};

export async function login(username: string, password: string): Promise<LoginResponse> {
  return request<LoginResponse>("/auth/login", {
    method: "POST",
    auth: false,
    body: { username, password },
  });
}

export async function fetchDissertations(queryParams: Record<string, string | number | undefined>): Promise<Dissertation[]> {
  const qs = new URLSearchParams();
  Object.entries(queryParams).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      qs.set(key, String(value));
    }
  });
  return request<Dissertation[]>(`/dissertations/?${qs.toString()}`);
}

export async function fetchCatalog(path: "scientific-directions" | "universities" | "regions" | "districts") {
  return request<CatalogItem[]>(`/catalogs/${path}`);
}

export async function askAI(question: string) {
  return request<{ answer: string; references: Array<Record<string, unknown>> }>("/ai/ask", {
    method: "POST",
    body: { question, top_k: 5 },
  });
}
