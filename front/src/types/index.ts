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
