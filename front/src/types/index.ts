export type RoleName = "admin" | "moderator" | "doctorant" | "supervisor" | "employee";

export type User = {
  id: number;
  username: string;
  email: string;
  is_active: boolean;
  role: {
    id: number;
    name: RoleName;
    description: string;
  };
};

export type DissertationStatus = "draft" | "pending" | "approved" | "rejected" | "defended";
export type DissertationFileKind = "autoreferat" | "pdf" | "word";

export type Dissertation = {
  id: number;
  title: string;
  scientific_direction_id: number;
  scientific_direction_name?: string;
  university_id: number;
  university_name?: string;
  author_id: number;
  author_name?: string;
  supervisor_id: number | null;
  supervisor_name?: string;
  problem: string;
  proposal: string;
  annotation: string;
  conclusion: string;
  keywords: string[];
  defense_date: string | null;
  status: DissertationStatus;
  category?: string;
  expert_rating?: number;
  region_id?: number | null;
  visibility?: "public" | "internal";
  autoreferat_file_name?: string | null;
  dissertation_pdf_file_name?: string | null;
  dissertation_word_file_name?: string | null;
  has_autoreferat_file?: boolean;
  has_dissertation_pdf_file?: boolean;
  has_dissertation_word_file?: boolean;
  created_at: string;
  updated_at: string;
};

export type DissertationDetail = Dissertation & {
  autoreferat_text?: string | null;
  dissertation_word_text?: string | null;
};

export type CatalogItem = {
  id: number;
  name: string;
};

// ─── Ko'p tilli katalog turlari ────────────────────────────────────────────────

export type Country = {
  id: number;
  name_uz: string;
  name_ru: string;
  name_en: string;
  code: string;
  created_at: string;
  updated_at: string;
};

export type ScientificDirection = {
  id: number;
  name_uz: string;
  name_ru: string;
  name_en: string;
  code?: string | null;
  description: string;
  created_at: string;
  updated_at: string;
};

export type University = {
  id: number;
  name_uz: string;
  name_ru: string;
  name_en: string;
  short_name: string;
  country_id?: number | null;
  region_id?: number | null;
  created_at: string;
  updated_at: string;
};

export type Region = {
  id: number;
  name_uz: string;
  name_ru: string;
  name_en: string;
  country_id?: number | null;
  created_at: string;
  updated_at: string;
};

export type District = {
  id: number;
  name_uz: string;
  name_ru: string;
  name_en: string;
  region_id: number;
  created_at: string;
  updated_at: string;
};

export type CountryPayload = Omit<Country, "id" | "created_at" | "updated_at">;
export type ScientificDirectionPayload = Omit<ScientificDirection, "id" | "created_at" | "updated_at">;
export type UniversityPayload = Omit<University, "id" | "created_at" | "updated_at">;
export type RegionPayload = Omit<Region, "id" | "created_at" | "updated_at">;
export type DistrictPayload = Omit<District, "id" | "created_at" | "updated_at">;

// ─── Dissertation wizard ──────────────────────────────────────────────────────

export type DissertationWizardData = {
  title: string;
  scientific_direction_id: number | null;
  university_id: number | null;
  country_id: number | null;
  region_id: number | null;
  defense_date: string;
  problem: string;
  proposal: string;
  keywords: string[];
  annotation: string;
  conclusion: string;
  author_id: number | null;
  supervisor_id: number | null;
  autoreferat_file: File | null;
  dissertation_pdf_file: File | null;
  dissertation_word_file: File | null;
  category: string;
  visibility: string;
};

export type UserLookup = {
  id: number;
  username: string;
  role_name: RoleName;
};

export type UserCreatePayload = {
  username: string;
  email: string;
  password: string;
  role_name: RoleName;
};

export type UserUpdatePayload = {
  username?: string;
  email?: string;
  password?: string;
  role_name?: RoleName;
  is_active?: boolean;
};

export type SearchQueryParams = {
  query?: string;
  title?: string;
  problem?: string;
  proposal?: string;
  annotation?: string;
  conclusion?: string;
  keywords?: string;
  author?: string;
  supervisor?: string;
  university_id?: number | string;
  scientific_direction_id?: number | string;
  year?: number | string;
  status?: string;
  category?: string;
  expert_rating_min?: number | string;
  region_id?: number | string;
  visibility?: string;
};
