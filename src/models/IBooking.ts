import { z } from 'zod';
import { Booking, IFormat, Room, Origin, Arrival, IOtaNotes } from './booking.dto';
import { TAdultChildConstraints } from './igl-book-property';
import { Currency, RoomType } from './property';
import { IRoomService } from './property-types';

export default interface IBooking {
  ID: string;
  NOTES: string;
  BALANCE?: string;
  NAME: string;
  RELEASE_AFTER_HOURS: number;
  PR_ID: number;
  ENTRY_DATE: string;
  FROM_DATE: string;
  TO_DATE: string;
  NO_OF_DAYS: number;
  STATUS: STATUS;
  PHONE: string;
  ADULTS_COUNT: number;
  COUNTRY: string;
  INTERNAL_NOTE?: string;
  RATE: string;
  TOTAL_PRICE: string;
  RATE_PLAN: string;
  ARRIVAL_TIME: string;
  OPTIONAL_REASON?: string;
  OUT_OF_SERVICE?: boolean;
  SPLIT_BOOKING?: boolean;
  RATE_PLAN_ID?: number;
  RATE_TYPE?: number;
}

export type STATUS =
  | 'IN-HOUSE'
  | 'CONFIRMED'
  | 'PENDING-CONFIRMATION'
  | 'SPLIT-UNIT'
  | 'CHECKED-IN'
  | 'CHECKED-OUT'
  | 'BLOCKED'
  | 'BLOCKED-WITH-DATES'
  | 'NOTES'
  | 'OUTSTANDING-BALANCE'
  | 'TEMP-EVENT';
export type bookingReasons =
  | 'DORESERVATION'
  | 'BLOCK_EXPOSED_UNIT'
  | 'REALLOCATE_EXPOSED_ROOM_BLOCK'
  | 'ASSIGN_EXPOSED_ROOM'
  | 'REALLOCATE_EXPOSED_ROOM_BOOK'
  | 'UNBLOCK_EXPOSED_UNIT'
  | 'DELETE_CALENDAR_POOL'
  | 'GET_UNASSIGNED_DATES'
  | 'UPDATE_CALENDAR_AVAILABILITY'
  | 'CHANGE_IN_DUE_AMOUNT'
  | 'CHANGE_IN_BOOK_STATUS'
  | 'NON_TECHNICAL_CHANGE_IN_BOOKING'
  | 'SHARING_PERSONS_UPDATED'
  | 'ROOM_STATUS_CHANGED'
  | 'UNIT_HK_STATUS_CHANGED'
  | 'EMAIL_VERIFIED'
  | 'ROOM_TYPE_CLOSE'
  | 'ROOM_TYPE_OPEN'
  | 'HK_SKIP';
export const validReasons = new Set<bookingReasons>([
  'DORESERVATION',
  'BLOCK_EXPOSED_UNIT',
  'ASSIGN_EXPOSED_ROOM',
  'REALLOCATE_EXPOSED_ROOM_BLOCK',
  'DELETE_CALENDAR_POOL',
  'GET_UNASSIGNED_DATES',
  'UPDATE_CALENDAR_AVAILABILITY',
  'CHANGE_IN_DUE_AMOUNT',
  'CHANGE_IN_BOOK_STATUS',
  'NON_TECHNICAL_CHANGE_IN_BOOKING',
]);
export type TCalendar = {
  adultChildConstraints: TAdultChildConstraints;
  allowedBookingSources: TAllowedBookingSource[];
  currency: Currency;
};
export type TAllowedBookingSource = {
  code: string;
  description: string;
  id: string;
  tag: string;
  type: 'SETUP' | 'LABEL' | 'TRAVEL_AGENCY';
};
export interface ICountry {
  cities: string[];
  id: number;
  name: string;
  phone_prefix: string;
  flag: string;
}
export const ZIEntrySchema = z.object({
  CODE_NAME: z.string(),
  CODE_VALUE_AR: z.string().nullable(),
  CODE_VALUE_DE: z.string().nullable(),
  CODE_VALUE_EL: z.string().nullable(),
  CODE_VALUE_EN: z.string().nullable(),
  CODE_VALUE_FR: z.string().nullable(),
  CODE_VALUE_HE: z.string().nullable(),
  CODE_VALUE_PL: z.string().nullable(),
  CODE_VALUE_RU: z.string().nullable(),
  CODE_VALUE_UA: z.string().nullable(),
  DISPLAY_ORDER: z.number().nullable(),
  ENTRY_DATE: z.string().nullable(),
  ENTRY_USER_ID: z.number().nullable(),
  INVARIANT_VALUE: z.string().nullable(),
  ISDELETEABLE: z.boolean(),
  ISDELETED: z.boolean(),
  ISSYSTEM: z.boolean(),
  ISUPDATEABLE: z.boolean(),
  ISVISIBLE: z.boolean(),
  NOTES: z.string().nullable(),
  OWNER_ID: z.number().nullable(),
  TBL_NAME: z.string(),
});

export type IEntries = {
  CODE_NAME: string;
  CODE_VALUE_AR: string;
  CODE_VALUE_DE: string;
  CODE_VALUE_EL: string;
  CODE_VALUE_EN: string;
  CODE_VALUE_FR: string;
  CODE_VALUE_HE: string;
  CODE_VALUE_PL: string;
  CODE_VALUE_RU: string;
  CODE_VALUE_UA: string;
  DISPLAY_ORDER: number;
  ENTRY_DATE: string;
  ENTRY_USER_ID: number;
  INVARIANT_VALUE: null;
  ISDELETEABLE: boolean;
  ISDELETED: boolean;
  ISSYSTEM: boolean;
  ISUPDATEABLE: boolean;
  ISVISIBLE: boolean;
  NOTES: string;
  OWNER_ID: number;
  TBL_NAME: string;
};
export interface ISetupEntries {
  arrivalTime: IEntries[];
  ratePricingMode: IEntries[];
  bedPreferenceType: IEntries[];
}

export interface CalendarData {
  months: MonthType[];
  from_date: string;
  to_date: string;
  property_data: IRoomService;
}
export interface MonthType {
  days: DayType[];
  description: string;
}

export interface DayType {
  description: string;
  value: string;
  occupancy: number;
  room_types: RoomType[];
  unassigned_units_nbr: number;
}

export interface IExposedInventory {
  blocked: number;
  booked: number;
  offline: number;
  rts: number;
  total: number;
}
export interface PhysicalRoomType {
  calendar_cell: CalendarCellType;
  id: number;
  name: string;
}

export interface CalendarCellType {
  left_cell: CellType;
  right_cell: CellType;
}

export interface CellType {
  Is_Available: boolean;
  booking: Booking | null;
  POOL: string;
  STAY_SHIFT_CODE: string;
  STAY_STATUS_CODE: string;
  DATE: string;
  My_Block_Info?: BlockInfo;
  pr_id: number;
  room: Room;
}

export interface BlockInfo {
  BLOCKED_TILL_DATE: string;
  BLOCKED_TILL_HOUR: number;
  BLOCKED_TILL_MINUTE: number;
  DESCRIPTION: string;
  NOTES: string;
  STAY_STATUS_CODE: string;
  from_date: string;
  pr_id: number;
  to_date: string;
  format: IFormat;
}

export interface RatePlanType {
  id: number;
  name: string;
  rate_restrictions: number | null;
}

export interface IBlockUnit {
  from_date: string;
  to_date: string;
  pr_id: string;
  STAY_STATUS_CODE: '003' | '004' | '002';
  DESCRIPTION: string;
  NOTES: string;
  BLOCKED_TILL_DATE?: string;
  BLOCKED_TILL_HOUR?: string;
  BLOCKED_TILL_MINUTE?: string;
}
export interface IDateRange {
  from_date: Date;
  to_date: Date;
}
export interface DateRangeSelection {
  fromDate: number;
  toDate: number;
  fromDateStr: string;
  toDateStr: string;
  dateDifference: number;
}
export interface BookingDetails {
  roomtypes: RoomDetail[];
  tax_statement: string;
}

export interface RoomDetail {
  availabilities: number | null;
  id: number;
  inventory: number;
  name: string;
  rate: number;
  is_active: boolean;
  is_bed_configuration_enabled: boolean;
  rateplans: RatePlanDetail[];
  physicalrooms: PhysicalRoomDetail[];
  exposed_inventory: null;
  occupancy_default: IoccupancyDefault;
}
export interface IoccupancyDefault {
  adult_nbr: number;
  children_nbr: number;
  infant_nbr: null;
}

export interface RatePlanDetail {
  id: number;
  name: string;
  rate_restrictions: null;
  variations: RateVariation[];
  meal_plan: {
    code: string;
    description: string;
  };
}
export interface RateVariation {
  adult_child_offering: string;
  adult_nbr: number;
  amount: number;
  child_nbr: number;
}
export interface PhysicalRoomDetail {
  calendar_cell: null;
  id: number;
  name: string;
}
export interface RatePlanDetail {
  id: number;
  name: string;
  rate_restrictions: null;
  variations: RateVariation[];
  totalRooms: number;
  index: number;
  isFirst: boolean;
}

type ChangedProperty = string;
export interface RoomRatePlanUpdateData {
  changedProperty: ChangedProperty;
  newValue: any;
  ratePlanIndex: number;
  rate: number;
}
export interface RoomRatePlanUpdateEvent {
  eventType: 'roomRatePlanUpdate';
  data: RoomRatePlanUpdateData;
}
export interface RoomUpdateEvent {
  roomRatePlanUpdateData: RoomRatePlanUpdateData;
  roomCategoryId: number;
  roomCategoryName: string;
}

export interface RoomBookingDetails {
  CHECKIN: boolean;
  CHECKOUT: boolean;
  ID: string;
  TO_DATE: string;
  ARRIVAL: Arrival;
  FROM_DATE: string;
  DEPARTURE_TIME: {
    code: string;
    description: string;
  };
  NO_OF_DAYS: number;
  IS_EDITABLE: boolean;
  PRIVATE_NOTE: string;
  STATUS: STATUS;
  NAME: string;
  PHONE: string;
  PHONE_PREFIX: string;
  ENTRY_DATE: string;
  RATE: number;
  RATE_PLAN: string;
  SPLIT_BOOKING: boolean;
  RATE_PLAN_ID: number;
  IDENTIFIER: string;
  RATE_TYPE: number;
  BALANCE: number | null;
  ADULTS_COUNT: number;
  CHILDREN_COUNT: number;
  PR_ID: number;
  POOL: string;
  GUEST: any;
  origin: Origin;
  channel_booking_nbr: string | null;
  is_direct: boolean;
  BOOKING_NUMBER: string;
  cancelation: string;
  guarantee: string;
  TOTAL_PRICE: number;
  COUNTRY: string;
  FROM_DATE_STR: string;
  TO_DATE_STR: string;
  adult_child_offering: string;
  ARRIVAL_TIME: string;
  NOTES: string;
  SOURCE: ISource;
  ROOMS: Room[];
  ota_notes: IOtaNotes[];
  defaultDates: {
    from_date: string;
    to_date: string;
  };
  BASE_STATUS_CODE: string;
  ROOM_INFO: Pick<Room, 'occupancy' | 'sharing_persons' | 'unit' | 'in_out'>;
}
export interface ISource {
  code: string;
  description: string;
  tag: string;
}
export interface RoomBlockDetails {
  ID: string;
  NOTES: string;
  BALANCE: string;
  NAME: string;
  RELEASE_AFTER_HOURS: string;
  PR_ID: string;
  ENTRY_DATE: string;
  ENTRY_HOUR: string;
  ENTRY_MINUTE: string;
  OPTIONAL_REASON: string;
  FROM_DATE: string;
  TO_DATE: string;
  NO_OF_DAYS: number;
  STATUS: STATUS;
  POOL: string;
  STATUS_CODE: string;
  OUT_OF_SERVICE: boolean;
  FROM_DATE_STR: string;
  TO_DATE_STR: string;
  defaultDates: {
    from_date: string;
    to_date: string;
  };
}
