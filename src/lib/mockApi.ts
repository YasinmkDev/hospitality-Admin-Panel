// Thin in-memory API mirroring Cizaro routes. Swap with real fetch later.
import * as data from "./mockData";
import type { UUID } from "./types";

const delay = <T>(v: T, ms = 250) => new Promise<T>((r) => setTimeout(() => r(v), ms));

function crud<T extends { [k: string]: any }>(store: T[], idKey: keyof T) {
  return {
    list: () => delay([...store]),
    get: (id: UUID) => delay(store.find((x) => x[idKey] === id) ?? null),
    add: (item: T) => {
      store.push(item);
      return delay(item);
    },
    update: (item: T) => {
      const i = store.findIndex((x) => x[idKey] === item[idKey]);
      if (i >= 0) store[i] = { ...store[i], ...item };
      return delay(item);
    },
    remove: (id: UUID) => {
      const i = store.findIndex((x) => x[idKey] === id);
      if (i >= 0) store.splice(i, 1);
      return delay({ ok: true });
    },
  };
}

export const api = {
  floor: crud(data.floors, "floorId"),
  room: crud(data.rooms, "roomId"),
  bed: crud(data.beds, "bedId"),
  roomType: crud(data.roomTypes, "roomTypeId"),
  roomFeature: crud(data.features, "rRoomFeaturesId"),
  roomProduct: crud(data.products, "rRoomProductsId"),
  roomRate: crud(data.rates, "rRoomRatesId"),
  season: crud(data.seasons, "seasonId"),
  reminder: crud(data.reminders, "roomReminderId"),
  reservation: crud(data.reservations, "roomEntryId"),
  dnr: crud(data.dnrs, "roomEntryDnrId"),
  houseKeeping: crud(data.housekeeping, "houseKeepingId"),
};

export const ctx = {
  companyId: data.COMPANY_ID,
  branchId: data.BRANCH_ID,
  employeeId: data.EMPLOYEE_ID,
};

export function newId() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
