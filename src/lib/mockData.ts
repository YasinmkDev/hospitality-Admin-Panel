import type {
  Bed,
  Floor,
  HouseKeeping,
  Room,
  RoomEntry,
  RoomEntryDnr,
  RoomFeature,
  RoomProduct,
  RoomRate,
  RoomReminder,
  RoomType,
  Season,
  UUID,
} from "./types";

const uuid = () =>
  "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });

export const COMPANY_ID: UUID = uuid();
export const BRANCH_ID: UUID = uuid();
export const EMPLOYEE_ID: UUID = uuid();

const base = { companyId: COMPANY_ID, branchId: BRANCH_ID, employeeId: EMPLOYEE_ID, isActive: true };

// ---- Floors ----
export const floors: Floor[] = Array.from({ length: 5 }).map((_, i) => ({
  ...base,
  floorId: uuid(),
  floorName: ["Ground", "Mezzanine", "Sky Lounge", "Garden View", "Penthouse"][i],
  floorNumber: i,
  numberRoomsOnFloor: 8 + i,
  numberBedsOnFloor: 12 + i * 2,
  description: "Curated floor with hospitality essentials.",
}));

// ---- Room Types ----
const typeNames = ["Standard", "Deluxe", "Suite", "Family", "Presidential"];
const typeColors = [0x2e7d32, 0x1565c0, 0xc9a66b, 0x6a1b9a, 0xc62828];
export const roomTypes: RoomType[] = typeNames.map((name, i) => ({
  ...base,
  roomTypeId: uuid(),
  roomType: name,
  defaultPrice: 80 + i * 60,
  color: typeColors[i],
  adultsNo: 1 + Math.min(i, 3),
  childNo: i > 1 ? 2 : 0,
  isSharedroom: false,
}));

// ---- Rooms ----
export const rooms: Room[] = [];
floors.forEach((f, fi) => {
  for (let r = 1; r <= f.numberRoomsOnFloor; r++) {
    const t = roomTypes[(fi + r) % roomTypes.length];
    rooms.push({
      ...base,
      roomId: uuid(),
      number: `${fi}${String(r).padStart(2, "0")}`,
      bedcount: t.adultsNo,
      floor: f.floorId,
      adultsNo: t.adultsNo,
      childNo: t.childNo,
      phoneExtension: `1${fi}${String(r).padStart(2, "0")}`,
      isInactiveRoom: false,
      isOccupied: Math.random() > 0.55,
      isOnlayout: true,
      roomTypeId: t.roomTypeId,
      reservationStatus: ["Available", "Reserved", "Occupied", "Cleaning"][Math.floor(Math.random() * 4)],
    });
  }
});

// ---- Beds ----
export const beds: Bed[] = rooms.flatMap((r) =>
  Array.from({ length: r.bedcount }).map((_, i) => ({
    ...base,
    bedId: uuid(),
    number: `${r.number}-${String.fromCharCode(65 + i)}`,
    roomId: r.roomId,
    floor: r.floor,
    isInactive: false,
    isOccupied: r.isOccupied && i === 0,
    isOnlayout: true,
    roomTypeId: r.roomTypeId,
  }))
);

// ---- Seasons ----
export const seasons: Season[] = [
  { ...base, seasonId: uuid(), seasonName: "Winter Escape", startDay: 1, startMonth: 12, endDay: 28, endMonth: 2, description: "Cozy winter rates" },
  { ...base, seasonId: uuid(), seasonName: "Spring Bloom", startDay: 1, startMonth: 3, endDay: 31, endMonth: 5, description: "Spring promotion" },
  { ...base, seasonId: uuid(), seasonName: "Summer Peak", startDay: 1, startMonth: 6, endDay: 31, endMonth: 8, description: "High season" },
  { ...base, seasonId: uuid(), seasonName: "Autumn Calm", startDay: 1, startMonth: 9, endDay: 30, endMonth: 11, description: "Mid season" },
];

// ---- Rates ----
export const rates: RoomRate[] = [];
roomTypes.forEach((t) => {
  seasons.forEach((s, si) => {
    const factor = [0.9, 1, 1.4, 1.05][si];
    const base$ = Math.round(t.defaultPrice * factor);
    rates.push({
      ...base,
      rRoomRatesId: uuid(),
      roomTypeId: t.roomTypeId,
      typeId: 0,
      seasonId: s.seasonId,
      tariff: base$,
      halfTariff: base$ / 2,
      extraAdultTariff: 25,
      extraChildTariff: 10,
      monTariff: base$,
      tueTariff: base$,
      wenTariff: base$,
      thrTariff: base$,
      friTariff: base$ * 1.15,
      satTariff: base$ * 1.2,
      sunTariff: base$ * 1.1,
      tariffTax: base$ * 0.1,
      halfTariffTax: 0,
      extraAdultTariffTax: 0,
      extraChildTariffTax: 0,
      monTariffTax: base$ * 0.1,
      tueTariffTax: base$ * 0.1,
      wenTariffTax: base$ * 0.1,
      thrTariffTax: base$ * 0.1,
      friTariffTax: base$ * 0.115,
      satTariffTax: base$ * 0.12,
      sunTariffTax: base$ * 0.11,
    });
  });
});

// ---- Features ----
const featureLabels = ["Sea View", "Balcony", "Air Conditioning", "Mini Bar", "Smart TV", "Soaking Tub", "King Bed", "Workspace"];
export const features: RoomFeature[] = featureLabels.map((name, i) => ({
  ...base,
  rRoomFeaturesId: uuid(),
  objectId: rooms[i % rooms.length].roomId,
  objectType: 1,
  roomFeatureId: uuid(),
  name,
}));

// ---- Products ----
const productLabels = ["Champagne", "Truffle Chocolate", "Spa Kit", "Late Checkout", "Breakfast", "Bottled Water"];
export const products: RoomProduct[] = productLabels.map((name, i) => ({
  ...base,
  rRoomProductsId: uuid(),
  objectId: rooms[i % rooms.length].roomId,
  objectType: 1,
  roomProductsId: uuid(),
  value: true,
  menuProductId: uuid(),
  quantity: 1,
  defaultPrice: [120, 35, 80, 50, 28, 6][i],
  name,
}));

// ---- Reminders ----
export const reminders: RoomReminder[] = rooms.slice(0, 6).map((r, i) => ({
  ...base,
  roomReminderId: uuid(),
  roomId: r.roomId,
  reminderSubject: ["VIP Guest Arrival", "Maintenance Check", "Linen Refresh", "Welcome Amenity", "Late Check-out", "Birthday Setup"][i],
  reminderDescription: "Coordinate with concierge and housekeeping.",
  reminderStartingTime: new Date(Date.now() + i * 3600_000).toISOString(),
  reminderEndingTime: new Date(Date.now() + (i + 1) * 3600_000).toISOString(),
  isEachDay: i % 3 === 0,
  isDone: i === 0,
}));

// ---- Reservations ----
const guestNames = ["Olivia Carter", "Lucas Bennett", "Sofia Martinez", "Ethan Walker", "Aria Thompson", "Noah Rivera", "Mia Anderson", "Liam Brooks"];
export const reservations: RoomEntry[] = guestNames.map((name, i) => {
  const arrival = new Date(Date.now() + (i - 2) * 86400_000);
  const departure = new Date(arrival.getTime() + (2 + (i % 4)) * 86400_000);
  const room = rooms[i % rooms.length];
  return {
    ...base,
    roomEntryId: uuid(),
    registrationNo: `REG-${1000 + i}`,
    voucherNo: `V-${5000 + i}`,
    customerId: uuid(),
    customerName: name,
    roomId: room.roomId,
    arrivalDate: arrival.toISOString(),
    departureDate: departure.toISOString(),
    noNights: 2 + (i % 4),
    adultNo: 1 + (i % 3),
    childNo: i % 2,
    totalOrder: 250 + i * 80,
    totalOrderRooms: 200 + i * 60,
    isPaid: i % 2 === 0,
    isOpen: i < 4,
    reservationStatus: [0, 1, 1, 0, 2, 1, 0, 3][i],
    remarks: "Prefers high floor, away from elevator.",
    roomEntryNo: 100 + i,
  };
});

// ---- DNR ----
export const dnrs: RoomEntryDnr[] = [
  { ...base, roomEntryDnrId: uuid(), customerId: uuid(), customerName: "John Doe", dnrId: uuid(), value: true, reason: "Damaged property" },
  { ...base, roomEntryDnrId: uuid(), customerId: uuid(), customerName: "Jane Smith", dnrId: uuid(), value: true, reason: "Repeated complaints" },
];

// ---- Housekeeping ----
export const housekeeping: HouseKeeping[] = rooms.slice(0, 9).map((r, i) => ({
  ...base,
  houseKeepingId: uuid(),
  objectId: r.roomId,
  objectTypeId: uuid(),
  status: i % 3,
  jobStartDate: new Date(Date.now() - i * 1800_000).toISOString(),
  jobEndDate: i % 3 === 2 ? new Date().toISOString() : undefined,
  assignee: ["Maria L.", "Carlos P.", "Anya K.", "Devon T.", "Fatima R."][i % 5],
  notes: "Standard turnover with linen change.",
}));
