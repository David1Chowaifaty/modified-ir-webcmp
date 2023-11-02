import { Booking, IFormat, Room } from "./booking.dto";
import { IRoomService } from "./property-types";

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
  | "IN-HOUSE"
  | "CONFIRMED"
  | "PENDING-CONFIRMATION"
  | "SPLIT-UNIT"
  | "CHECKED-IN"
  | "CHECKED-OUT"
  | "BLOCKED"
  | "BLOCKED-WITH-DATES"
  | "NOTES"
  | "OUTSTANDING-BALANCE";

export interface ICountry {
  cities: string[];
  id: number;
  name: string;
  phone_prefix: string;
}
export interface IEntries {
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
}
export interface ISetupEntries {
  arrivalTime: IEntries[];
  bookingSource: IEntries[];
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
  occupancy: number;
  room_types: RoomType[];
  unassigned_units_nbr: number;
}

export interface RoomType {
  availabilities: number | null;
  id: number;
  inventory: number;
  name: string;
  physicalrooms: PhysicalRoomType[];
  rate: number;
  rateplans: RatePlanType[];
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
  STAY_STATUS_CODE: "003" | "004"|"002";
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
  rateplans: RatePlanDetail[];
  physicalrooms: PhysicalRoomDetail[];
}

export interface RatePlanDetail {
  id: number;
  name: string;
  rate_restrictions: null;
  variations: RateVariation[];
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
  eventType: "roomRatePlanUpdate";
  data: RoomRatePlanUpdateData;
}
export interface RoomUpdateEvent {
  roomRatePlanUpdateData: RoomRatePlanUpdateData;
  roomCategoryId: number;
  roomCategoryName: string;
}
