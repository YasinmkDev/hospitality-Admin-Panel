// Types mirror Cizaro API payload shapes

export type UUID = string;

export interface BaseEntity {
  companyId?: UUID;
  branchId?: UUID;
  employeeId?: UUID;
  customFields?: Record<string, string>;
  refBranchIds?: UUID[];
  refBranches?: string;
  isActive?: boolean;
}

export interface Floor extends BaseEntity {
  floorId: UUID;
  floorName: string;
  floorNumber: number;
  numberRoomsOnFloor: number;
  numberBedsOnFloor: number;
  description?: string;
}

export interface RoomType extends BaseEntity {
  roomTypeId: UUID;
  roomType: string;
  defaultPrice: number;
  color: number; // hex packed
  adultsNo: number;
  childNo: number;
  objectType?: number;
  imageData?: string;
  isSharedroom?: boolean;
}

export interface Room extends BaseEntity {
  roomId: UUID;
  number: string;
  bedcount: number;
  floor: UUID;
  remarks?: string;
  connectRoomId?: UUID;
  adultsNo: number;
  childNo: number;
  phoneExtension?: string;
  isInactiveRoom?: boolean;
  isSharedroom?: boolean;
  isOccupied?: boolean;
  isOnlayout?: boolean;
  roomTypeId: UUID;
  reservationStatus?: string;
  select?: boolean;
}

export interface Bed extends BaseEntity {
  bedId: UUID;
  number: string;
  roomId: UUID;
  floor: UUID;
  remarks?: string;
  connectRoomId?: UUID;
  isInactive?: boolean;
  isOccupied?: boolean;
  isOnlayout?: boolean;
  roomTypeId?: UUID;
}

export interface RoomFeature extends BaseEntity {
  rRoomFeaturesId: UUID;
  objectId: UUID;
  objectType: number;
  roomFeatureId: UUID;
  name?: string; // display only
}

export interface RoomProduct extends BaseEntity {
  rRoomProductsId: UUID;
  objectId: UUID;
  objectType: number;
  roomProductsId: UUID;
  value: boolean;
  menuProductId: UUID;
  quantity: number;
  defaultPrice: number;
  name?: string;
}

export interface RoomRate extends BaseEntity {
  rRoomRatesId: UUID;
  roomTypeId: UUID;
  typeId: number;
  rateTypesId?: UUID;
  seasonId: UUID;
  contactId?: UUID;
  tariff: number;
  halfTariff: number;
  extraAdultTariff: number;
  extraChildTariff: number;
  monTariff: number;
  tueTariff: number;
  wenTariff: number;
  thrTariff: number;
  friTariff: number;
  satTariff: number;
  sunTariff: number;
  tariffTax: number;
  halfTariffTax: number;
  extraAdultTariffTax: number;
  extraChildTariffTax: number;
  monTariffTax: number;
  tueTariffTax: number;
  wenTariffTax: number;
  thrTariffTax: number;
  friTariffTax: number;
  satTariffTax: number;
  sunTariffTax: number;
}

export interface Season extends BaseEntity {
  seasonId: UUID;
  seasonName: string;
  description?: string;
  startDay: number;
  startMonth: number;
  endDay: number;
  endMonth: number;
}

export interface RoomReminder extends BaseEntity {
  roomReminderId: UUID;
  roomId: UUID;
  reminderSubject: string;
  reminderDescription?: string;
  reminderStartingTime: string;
  reminderEndingTime: string;
  isEachDay?: boolean;
  isDone?: boolean;
}

export interface RoomEntry extends BaseEntity {
  roomEntryId: UUID;
  transactionEmployeeId?: UUID;
  registrationNo: string;
  voucherNo: string;
  customerId: UUID;
  customerName?: string; // display
  roomId?: UUID; // display
  arrivalDate: string;
  departureDate: string;
  noNights: number;
  adultNo: number;
  childNo: number;
  totalOrder: number;
  totalOrderRooms: number;
  isPaid?: boolean;
  isOpen?: boolean;
  reservationStatus: number; // 0 reserved, 1 checked-in, 2 checked-out, 3 cancelled
  remarks?: string;
  roomEntryNo: number;
  roomEntryTypeId?: number;
}

export interface RoomEntryDnr extends BaseEntity {
  roomEntryDnrId: UUID;
  customerId: UUID;
  customerName?: string;
  dnrId: UUID;
  reason?: string;
  value: boolean;
}

export interface HouseKeeping extends BaseEntity {
  houseKeepingId: UUID;
  objectId: UUID; // room
  objectTypeId: UUID;
  status: number; // 0 pending, 1 in progress, 2 done
  jobStartDate: string;
  jobEndDate?: string;
  departmentId?: UUID;
  assignee?: string;
  notes?: string;
}

export const RESERVATION_STATUS_LABELS: Record<number, string> = {
  0: "Reserved",
  1: "Checked-In",
  2: "Checked-Out",
  3: "Cancelled",
};

export const HK_STATUS_LABELS: Record<number, string> = {
  0: "Pending",
  1: "In Progress",
  2: "Done",
};
