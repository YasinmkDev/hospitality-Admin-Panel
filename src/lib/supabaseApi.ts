// Supabase-backed API with resilient local mock fallback.
// Pages import from mockApi (which re-exports this).
import { supabase, isSupabaseConfigured } from "./supabase";
import type { UUID } from "./types";
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
  const storageKey = `cizaro_table_${table}`;
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
  const storageKey = `cizaro_table_${table}`;
  try {
    localStorage.setItem(storageKey, JSON.stringify(data));
  } catch (err) {
    console.warn(`[LocalStore] Failed writing ${storageKey}:`, err);
  }
}

export function resetLocalStoreToDefaults(): void {
  Object.keys(defaultDataMap).forEach((table) => {
    const storageKey = `cizaro_table_${table}`;
    localStorage.setItem(storageKey, JSON.stringify(defaultDataMap[table]));
  });
}

function sbCrud<T extends Record<string, unknown>>(table: string, idKey: keyof T) {
  return {
    list: async (): Promise<T[]> => {
      if (isSupabaseConfigured) {
        try {
          const { data, error } = await supabase.from(table).select("*");
          if (!error && data) {
            setLocalStore(table, data as T[]);
            return data as T[];
          }
        } catch (err) {
          console.warn(`[Supabase] ${table}.list fallback to local store`, err);
        }
      }
      return getLocalStore<T>(table);
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
        [idKey]: item[idKey] || newId(),
      } as T;

      if (isSupabaseConfigured) {
        try {
          const { data, error } = await supabase.from(table).insert(fullItem).select().single();
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
            .update(item)
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
  floor:        sbCrud("floors",        "floorId"),
  room:         sbCrud("rooms",         "roomId"),
  bed:          sbCrud("beds",          "bedId"),
  roomType:     sbCrud("room_types",    "roomTypeId"),
  roomFeature:  sbCrud("room_features", "rRoomFeaturesId"),
  roomProduct:  sbCrud("room_products", "rRoomProductsId"),
  roomRate:     sbCrud("room_rates",    "rRoomRatesId"),
  season:       sbCrud("seasons",       "seasonId"),
  reminder:     sbCrud("reminders",     "roomReminderId"),
  reservation:  sbCrud("reservations",  "roomEntryId"),
  dnr:          sbCrud("dnrs",          "roomEntryDnrId"),
  houseKeeping: sbCrud("housekeeping",  "houseKeepingId"),
};

export function newId() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
