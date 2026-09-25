// Supabase-backed API with resilient local mock fallback.
// Pages import from mockApi (which re-exports this).
import { supabase, isSupabaseConfigured } from "./supabase";
import type {
  UUID,
  PaginationParams,
  PaginatedResult,
  Floor,
  Room,
  Bed,
  RoomType,
  RoomFeature,
  RoomProduct,
  RoomRate,
  Season,
  RoomReminder,
  RoomEntry,
  RoomEntryDnr,
  HouseKeeping,
} from "./types";
import {
  floors,
  roomTypes,
  rooms,
  beds,
  seasons,
  rates,
  features,
  products,
  reminders,
  reservations,
  dnrs,
  housekeeping,
} from "./mockData";

const defaultDataMap: Record<string, unknown[]> = {
  floors,
  room_types: roomTypes,
  rooms,
  beds,
  seasons,
  room_rates: rates,
  room_features: features,
  room_products: products,
  reminders,
  reservations,
  dnrs,
  housekeeping,
};

function getLocalStore<T>(table: string): T[] {
  const storageKey = `hms_table_${table}`;
  try {
    const raw = localStorage.getItem(storageKey);
    if (raw) {
      return JSON.parse(raw);
    }
    const initial = (defaultDataMap[table] ?? []) as T[];
    localStorage.setItem(storageKey, JSON.stringify(initial));
    return initial;
  } catch (err) {
    console.warn(`[LocalStore] Failed reading ${storageKey}:`, err);
    return (defaultDataMap[table] ?? []) as T[];
  }
}

function setLocalStore<T>(table: string, data: T[]): void {
  const storageKey = `hms_table_${table}`;
  try {
    localStorage.setItem(storageKey, JSON.stringify(data));
  } catch (err) {
    console.warn(`[LocalStore] Failed writing ${storageKey}:`, err);
  }
}

export function resetLocalStoreToDefaults(): void {
  Object.keys(defaultDataMap).forEach((table) => {
    const storageKey = `hms_table_${table}`;
    localStorage.setItem(storageKey, JSON.stringify(defaultDataMap[table]));
  });
}

function sbCrud<T extends object>(table: string, idKey: keyof T) {
  return {
    paginate: async (params?: PaginationParams): Promise<PaginatedResult<T>> => {
      const page = Math.max(1, params?.page || 1);
      const pageSize = Math.max(1, params?.pageSize || 10);
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      if (isSupabaseConfigured) {
        try {
          let query = supabase.from(table).select("*", { count: "exact" });

          // Apply filters
          if (params?.filters) {
            Object.entries(params.filters).forEach(([k, v]) => {
              if (v !== undefined && v !== null && v !== "" && v !== "all") {
                query = query.eq(k, v);
              }
            });
          }

          // Apply search
          if (params?.search && params.search.trim()) {
            const term = params.search.trim();
            if (params.searchFields && params.searchFields.length > 0) {
              const orConditions = params.searchFields.map((f) => `${f}.ilike.%${term}%`).join(",");
              query = query.or(orConditions);
            }
          }

          // Apply sorting
          if (params?.sortBy) {
            query = query.order(params.sortBy, { ascending: params.sortOrder !== "desc" });
          }

          query = query.range(from, to);

          const { data, count, error } = await query;
          if (!error && data !== null) {
            const total = count ?? data.length;
            return {
              data: data as T[],
              total,
              page,
              pageSize,
              totalPages: Math.max(1, Math.ceil(total / pageSize)),
            };
          }
        } catch (err) {
          console.warn(`[Supabase] ${table}.paginate fallback to local store`, err);
        }
      }

      // Local fallback logic
      let list = getLocalStore<T>(table);

      // Filters
      if (params?.filters) {
        list = list.filter((item) => {
          const rec = item as Record<string, unknown>;
          for (const [k, v] of Object.entries(params.filters!)) {
            if (v !== undefined && v !== null && v !== "" && v !== "all") {
              if (String(rec[k]) !== String(v)) return false;
            }
          }
          return true;
        });
      }

      // Search
      if (params?.search && params.search.trim()) {
        const q = params.search.trim().toLowerCase();
        list = list.filter((item) => {
          const rec = item as Record<string, unknown>;
          if (params.searchFields && params.searchFields.length > 0) {
            return params.searchFields.some((f) => {
              const val = rec[f];
              return val !== undefined && val !== null && String(val).toLowerCase().includes(q);
            });
          }
          return Object.values(rec).some(
            (v) => v !== undefined && v !== null && String(v).toLowerCase().includes(q)
          );
        });
      }

      // Sort
      if (params?.sortBy) {
        const col = params.sortBy;
        const mult = params.sortOrder === "desc" ? -1 : 1;
        list = [...list].sort((a, b) => {
          const va = (a as Record<string, unknown>)[col];
          const vb = (b as Record<string, unknown>)[col];
          if (va === vb) return 0;
          if (va === undefined || va === null) return 1;
          if (vb === undefined || vb === null) return -1;
          if (typeof va === "number" && typeof vb === "number") return (va - vb) * mult;
          return String(va).localeCompare(String(vb)) * mult;
        });
      }

      const total = list.length;
      const paged = list.slice(from, to + 1);

      return {
        data: paged,
        total,
        page,
        pageSize,
        totalPages: Math.max(1, Math.ceil(total / pageSize)),
      };
    },

    list: async (filters?: Record<string, unknown>): Promise<T[]> => {
      if (isSupabaseConfigured) {
        try {
          let query = supabase.from(table).select("*");
          if (filters) {
            Object.entries(filters).forEach(([k, v]) => {
              if (v !== undefined && v !== null && v !== "" && v !== "all") {
                query = query.eq(k, v);
              }
            });
          }
          const { data, error } = await query;
          if (!error && data) {
            setLocalStore(table, data as T[]);
            return data as T[];
          }
        } catch (err) {
          console.warn(`[Supabase] ${table}.list fallback to local store`, err);
        }
      }
      let list = getLocalStore<T>(table);
      if (filters) {
        list = list.filter((item) => {
          const rec = item as Record<string, unknown>;
          for (const [k, v] of Object.entries(filters)) {
            if (v !== undefined && v !== null && v !== "" && v !== "all") {
              if (String(rec[k]) !== String(v)) return false;
            }
          }
          return true;
        });
      }
      return list;
    },

    get: async (id: UUID): Promise<T | null> => {
      if (isSupabaseConfigured) {
        try {
          const { data, error } = await supabase
            .from(table)
            .select("*")
            .eq(idKey as string, id)
            .maybeSingle();
          if (!error && data) return data as T;
        } catch (err) {
          console.warn(`[Supabase] ${table}.get fallback to local store`, err);
        }
      }
      const list = getLocalStore<T>(table);
      return list.find((item) => String(item[idKey]) === String(id)) ?? null;
    },

    add: async (item: T): Promise<T> => {
      const fullItem = {
        ...item,
        [idKey]: item[idKey] || (newId() as unknown as T[keyof T]),
      } as T;

      if (isSupabaseConfigured) {
        try {
          const { data, error } = await supabase.from(table).insert(fullItem as any).select().single();
          if (!error && data) {
            const list = getLocalStore<T>(table);
            setLocalStore(table, [data as T, ...list]);
            return data as T;
          }
        } catch (err) {
          console.warn(`[Supabase] ${table}.add fallback to local store`, err);
        }
      }

      const list = getLocalStore<T>(table);
      const updated = [fullItem, ...list];
      setLocalStore(table, updated);
      return fullItem;
    },

    update: async (item: T): Promise<T> => {
      if (isSupabaseConfigured) {
        try {
          const { data, error } = await supabase
            .from(table)
            .update(item as any)
            .eq(idKey as string, item[idKey])
            .select()
            .single();
          if (!error && data) {
            const list = getLocalStore<T>(table);
            const idx = list.findIndex((x) => String(x[idKey]) === String(item[idKey]));
            if (idx >= 0) list[idx] = data as T;
            setLocalStore(table, [...list]);
            return data as T;
          }
        } catch (err) {
          console.warn(`[Supabase] ${table}.update fallback to local store`, err);
        }
      }

      const list = getLocalStore<T>(table);
      const idx = list.findIndex((x) => String(x[idKey]) === String(item[idKey]));
      if (idx >= 0) {
        list[idx] = { ...list[idx], ...item };
        setLocalStore(table, [...list]);
        return list[idx];
      }
      setLocalStore(table, [item, ...list]);
      return item;
    },

    remove: async (id: UUID): Promise<{ ok: boolean }> => {
      if (isSupabaseConfigured) {
        try {
          const { error } = await supabase.from(table).delete().eq(idKey as string, id);
          if (!error) {
            const list = getLocalStore<T>(table);
            setLocalStore(table, list.filter((x) => String(x[idKey]) !== String(id)));
            return { ok: true };
          }
        } catch (err) {
          console.warn(`[Supabase] ${table}.remove fallback to local store`, err);
        }
      }

      const list = getLocalStore<T>(table);
      setLocalStore(table, list.filter((x) => String(x[idKey]) !== String(id)));
      return { ok: true };
    },
  };
}

export const api = {
  floor:        sbCrud<Floor>("floors",               "floorId"),
  room:         sbCrud<Room>("rooms",                 "roomId"),
  bed:          sbCrud<Bed>("beds",                   "bedId"),
  roomType:     sbCrud<RoomType>("room_types",        "roomTypeId"),
  roomFeature:  sbCrud<RoomFeature>("room_features",  "rRoomFeaturesId"),
  roomProduct:  sbCrud<RoomProduct>("room_products",  "rRoomProductsId"),
  roomRate:     sbCrud<RoomRate>("room_rates",        "rRoomRatesId"),
  season:       sbCrud<Season>("seasons",             "seasonId"),
  reminder:     sbCrud<RoomReminder>("reminders",     "roomReminderId"),
  reservation:  sbCrud<RoomEntry>("reservations",      "roomEntryId"),
  dnr:          sbCrud<RoomEntryDnr>("dnrs",          "roomEntryDnrId"),
  houseKeeping: sbCrud<HouseKeeping>("housekeeping",  "houseKeepingId"),
};

export function newId() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
