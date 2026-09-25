// Run once to seed Supabase with placeholder data.
// Call seedDatabase() from a button in Settings or run via browser console.
import { supabase } from "./supabase";
import {
  floors, roomTypes, rooms, beds, seasons, rates,
  features, products, reminders, reservations, dnrs, housekeeping,
} from "./mockData";

type SeedTable = { table: string; rows: Record<string, unknown>[] };

const tables: SeedTable[] = [
  { table: "floors",        rows: floors },
  { table: "room_types",    rows: roomTypes },
  { table: "rooms",         rows: rooms },
  { table: "beds",          rows: beds },
  { table: "seasons",       rows: seasons },
  { table: "room_rates",    rows: rates },
  { table: "room_features", rows: features },
  { table: "room_products", rows: products },
  { table: "reminders",     rows: reminders },
  { table: "reservations",  rows: reservations },
  { table: "dnrs",          rows: dnrs },
  { table: "housekeeping",  rows: housekeeping },
];

export async function seedDatabase(): Promise<{ ok: boolean; errors: string[] }> {
  const errors: string[] = [];

  for (const { table, rows } of tables) {
    const { error } = await supabase.from(table).upsert(rows as never[], { ignoreDuplicates: true });
    if (error) errors.push(`${table}: ${error.message}`);
  }

  return { ok: errors.length === 0, errors };
}
