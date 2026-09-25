// Supabase-backed API — same interface as mockApi so pages need no changes.
import { supabase } from "./supabase";
import type { UUID } from "./types";

function sbCrud<T extends Record<string, unknown>>(table: string, idKey: keyof T) {
  return {
    list: async (): Promise<T[]> => {
      const { data, error } = await supabase.from(table).select("*");
      if (error) throw error;
      return (data ?? []) as T[];
    },
    get: async (id: UUID): Promise<T | null> => {
      const { data, error } = await supabase.from(table).select("*").eq(idKey as string, id).maybeSingle();
      if (error) throw error;
      return data as T | null;
    },
    add: async (item: T): Promise<T> => {
      const { data, error } = await supabase.from(table).insert(item).select().single();
      if (error) throw error;
      return data as T;
    },
    update: async (item: T): Promise<T> => {
      const { data, error } = await supabase
        .from(table)
        .update(item)
        .eq(idKey as string, item[idKey])
        .select()
        .single();
      if (error) throw error;
      return data as T;
    },
    remove: async (id: UUID): Promise<{ ok: boolean }> => {
      const { error } = await supabase.from(table).delete().eq(idKey as string, id);
      if (error) throw error;
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
