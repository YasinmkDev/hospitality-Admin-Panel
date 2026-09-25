-- ============================================================
-- Hospitality Admin Panel — Supabase Schema
-- Run this in the Supabase SQL Editor (Dashboard > SQL Editor)
-- ============================================================

-- Enable UUID extension (already enabled on Supabase by default)
-- create extension if not exists "pgcrypto";

-- ---- floors ----
create table if not exists floors (
  "floorId"              text primary key,
  "floorName"            text not null,
  "floorNumber"          int  not null,
  "numberRoomsOnFloor"   int  default 0,
  "numberBedsOnFloor"    int  default 0,
  description            text,
  "companyId"            text,
  "branchId"             text,
  "employeeId"           text,
  "isActive"             boolean default true
);

-- ---- room_types ----
create table if not exists room_types (
  "roomTypeId"    text primary key,
  "roomType"      text not null,
  "defaultPrice"  numeric default 0,
  color           bigint  default 0,
  "adultsNo"      int     default 1,
  "childNo"       int     default 0,
  "objectType"    int,
  "imageData"     text,
  "isSharedroom"  boolean default false,
  "companyId"     text,
  "branchId"      text,
  "employeeId"    text,
  "isActive"      boolean default true
);

-- ---- rooms ----
create table if not exists rooms (
  "roomId"              text primary key,
  number                text not null,
  bedcount              int  default 1,
  floor                 text references floors("floorId") on delete set null,
  remarks               text,
  "connectRoomId"       text,
  "adultsNo"            int  default 1,
  "childNo"             int  default 0,
  "phoneExtension"      text,
  "isInactiveRoom"      boolean default false,
  "isSharedroom"        boolean default false,
  "isOccupied"          boolean default false,
  "isOnlayout"          boolean default true,
  "roomTypeId"          text references room_types("roomTypeId") on delete set null,
  "reservationStatus"   text,
  "companyId"           text,
  "branchId"            text,
  "employeeId"          text,
  "isActive"            boolean default true
);

-- ---- beds ----
create table if not exists beds (
  "bedId"          text primary key,
  number           text not null,
  "roomId"         text references rooms("roomId") on delete cascade,
  floor            text references floors("floorId") on delete set null,
  remarks          text,
  "connectRoomId"  text,
  "isInactive"     boolean default false,
  "isOccupied"     boolean default false,
  "isOnlayout"     boolean default true,
  "roomTypeId"     text,
  "companyId"      text,
  "branchId"       text,
  "employeeId"     text,
  "isActive"       boolean default true
);

-- ---- seasons ----
create table if not exists seasons (
  "seasonId"    text primary key,
  "seasonName"  text not null,
  description   text,
  "startDay"    int  not null,
  "startMonth"  int  not null,
  "endDay"      int  not null,
  "endMonth"    int  not null,
  "companyId"   text,
  "branchId"    text,
  "employeeId"  text,
  "isActive"    boolean default true
);

-- ---- room_rates ----
create table if not exists room_rates (
  "rRoomRatesId"          text primary key,
  "roomTypeId"            text references room_types("roomTypeId") on delete cascade,
  "typeId"                int  default 0,
  "rateTypesId"           text,
  "seasonId"              text references seasons("seasonId") on delete cascade,
  "contactId"             text,
  tariff                  numeric default 0,
  "halfTariff"            numeric default 0,
  "extraAdultTariff"      numeric default 0,
  "extraChildTariff"      numeric default 0,
  "monTariff"             numeric default 0,
  "tueTariff"             numeric default 0,
  "wenTariff"             numeric default 0,
  "thrTariff"             numeric default 0,
  "friTariff"             numeric default 0,
  "satTariff"             numeric default 0,
  "sunTariff"             numeric default 0,
  "tariffTax"             numeric default 0,
  "halfTariffTax"         numeric default 0,
  "extraAdultTariffTax"   numeric default 0,
  "extraChildTariffTax"   numeric default 0,
  "monTariffTax"          numeric default 0,
  "tueTariffTax"          numeric default 0,
  "wenTariffTax"          numeric default 0,
  "thrTariffTax"          numeric default 0,
  "friTariffTax"          numeric default 0,
  "satTariffTax"          numeric default 0,
  "sunTariffTax"          numeric default 0,
  "companyId"             text,
  "branchId"              text,
  "employeeId"            text,
  "isActive"              boolean default true
);

-- ---- room_features ----
create table if not exists room_features (
  "rRoomFeaturesId"  text primary key,
  "objectId"         text,
  "objectType"       int  default 1,
  "roomFeatureId"    text,
  name               text,
  "companyId"        text,
  "branchId"         text,
  "employeeId"       text,
  "isActive"         boolean default true
);

-- ---- room_products ----
create table if not exists room_products (
  "rRoomProductsId"  text primary key,
  "objectId"         text,
  "objectType"       int     default 1,
  "roomProductsId"   text,
  value              boolean default true,
  "menuProductId"    text,
  quantity           int     default 1,
  "defaultPrice"     numeric default 0,
  name               text,
  "companyId"        text,
  "branchId"         text,
  "employeeId"       text,
  "isActive"         boolean default true
);

-- ---- reminders ----
create table if not exists reminders (
  "roomReminderId"        text primary key,
  "roomId"                text references rooms("roomId") on delete cascade,
  "reminderSubject"       text not null,
  "reminderDescription"   text,
  "reminderStartingTime"  text not null,
  "reminderEndingTime"    text not null,
  "isEachDay"             boolean default false,
  "isDone"                boolean default false,
  "companyId"             text,
  "branchId"              text,
  "employeeId"            text,
  "isActive"              boolean default true
);

-- ---- reservations ----
create table if not exists reservations (
  "roomEntryId"          text primary key,
  "transactionEmployeeId" text,
  "registrationNo"       text,
  "voucherNo"            text,
  "customerId"           text not null,
  "customerName"         text,
  "roomId"               text,
  "arrivalDate"          text not null,
  "departureDate"        text not null,
  "noNights"             int  default 1,
  "adultNo"              int  default 1,
  "childNo"              int  default 0,
  "totalOrder"           numeric default 0,
  "totalOrderRooms"      numeric default 0,
  "isPaid"               boolean default false,
  "isOpen"               boolean default true,
  "reservationStatus"    int  default 0,
  remarks                text,
  "roomEntryNo"          int,
  "roomEntryTypeId"      int,
  "companyId"            text,
  "branchId"             text,
  "employeeId"           text,
  "isActive"             boolean default true
);

-- ---- dnrs ----
create table if not exists dnrs (
  "roomEntryDnrId"  text primary key,
  "customerId"      text not null,
  "customerName"    text,
  "dnrId"           text,
  reason            text,
  value             boolean default true,
  "companyId"       text,
  "branchId"        text,
  "employeeId"      text,
  "isActive"        boolean default true
);

-- ---- housekeeping ----
create table if not exists housekeeping (
  "houseKeepingId"  text primary key,
  "objectId"        text,
  "objectTypeId"    text,
  status            int  default 0,
  "jobStartDate"    text not null,
  "jobEndDate"      text,
  "departmentId"    text,
  assignee          text,
  notes             text,
  "companyId"       text,
  "branchId"        text,
  "employeeId"      text,
  "isActive"        boolean default true
);

-- ============================================================
-- Row Level Security — allow authenticated users full access
-- ============================================================
do $$
declare
  t text;
begin
  foreach t in array array[
    'floors','room_types','rooms','beds','seasons','room_rates',
    'room_features','room_products','reminders','reservations','dnrs','housekeeping'
  ] loop
    execute format('alter table %I enable row level security', t);
    execute format('drop policy if exists "auth_all_%s" on %I', t, t);
    execute format(
      'create policy "auth_all_%s" on %I for all to authenticated using (true) with check (true)',
      t, t
    );
  end loop;
end $$;
