// All pages import from here — now backed by Supabase.
export { api, newId } from "./supabaseApi";
export type { PaginationParams, PaginatedResult } from "./types";

// ctx is kept for backward compat (pages use it to stamp companyId etc.)
// Values are empty strings since Supabase rows don't require them.
export const ctx = {
  companyId: "",
  branchId: "",
  employeeId: "",
};
