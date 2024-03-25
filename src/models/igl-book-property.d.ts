import { Arrival } from './booking.dto';

export type FooterButtonType = 'cancel' | 'next';
export type BookUserParams = [
  any,
  boolean,
  Date,
  Date,
  any,
  number,
  { code: string; description: string },
  number,
  any[],
  { id: number; code: string },
  string | undefined,
  any | undefined,
  any | undefined,
  number | undefined,
  string | undefined,
];
export type TPropertyButtonsTypes = 'cancel' | 'save' | 'back' | 'book' | 'bookAndCheckIn' | 'next' | 'check';
export type TSourceOption = { code: string; description: string; tag: string };
export type TSourceOptions = { id: string; value: string; tag: string; type: string };
export type TAdultChildConstraints = { adult_max_nbr: number | null; child_max_nbr: number | null; child_max_age: number | null };
export type TEventType = 'BLOCK_DATES' | 'SPLIT_BOOKING' | 'BAR_BOOKING' | 'ADD_ROOM' | 'EDIT_BOOKING' | 'PLUS_BOOKING';

export interface IglBookPropertyPayload {
  ID: string;
  NAME: string;
  EMAIL: string;
  PHONE: string;
  REFERENCE_TYPE: string;
  FROM_DATE: string;
  TO_DATE: string;
  TITLE: string;
  event_type: TEventType;
  defaultDateRange: IDefaultDateRange;
}

export interface IDefaultDateRange {
  fromDate: Date;
  fromDateStr: string;
  toDate: Date;
  toDateStr: string;
  dateDifference: number;
  editable?: boolean;
  message: string;
}

interface IglBookPropertyPayloadPlusBooking extends IglBookPropertyPayload {
  event_type: 'PLUS_BOOKING';
}

interface IglBookPropertyPayloadEditBooking extends IglBookPropertyPayload {
  event_type: 'EDIT_BOOKING';
  NO_OF_DAYS: number;
  STATUS: string;
  IDENTIFIER: string;
  PR_ID: number;
  POOL: string;
  BOOKING_NUMBER: string;
  NOTES: string;
  is_direct: boolean;
  bed_preference: number | null;
  ARRIVAL_TIME: string;
  ARRIVAL: {
    code: string;
    description: string;
  };
  IS_EDITABLE: boolean;
  ENTRY_DATE?: string;
  RATE: number;
  RATE_PLAN: string;
  SPLIT_BOOKING: boolean;
  RATE_PLAN_ID: number;
  RATE_TYPE: number;
  ADULTS_COUNT: number;
  CHILDREN_COUNT: number;
  GUEST: {};
  ROOMS: Array<{}>;
  cancelation: string;
  guarantee: string;
  TOTAL_PRICE: number;
  COUNTRY: number;
  FROM_DATE_STR: string;
  TO_DATE_STR: string;
  adult_child_offering: string;
  origin: {
    Icon: string;
    Label: string;
  };
  channel_booking_nbr: string;
  SOURCE: {
    code: string;
    description: string;
    tag?: string;
  };
  legendData: any;
  roomsInfo: any;
  roomName: string;
}

interface IglBookPropertyPayloadAddRoom extends IglBookPropertyPayload {
  event_type: 'ADD_ROOM';
  BOOKING_NUMBER?: string;
  ADD_ROOM_TO_BOOKING?: string;
  GUEST?: {};
  message?: string;
  SOURCE?: {
    code: string;
    description: string;
    tag?: string;
  };
  ROOMS?: Array<{}>;
  ARRIVAL: Arrival;
}

interface IglBookPropertyPayloadBarBooking extends IglBookPropertyPayload {
  event_type: 'BAR_BOOKING';
  NOTES: string;
  BALANCE: string;
  RELEASE_AFTER_HOURS: string;
  PR_ID: string;
  ENTRY_DATE: string;
  ENTRY_HOUR: number;
  ENTRY_MINUTE: number;
  OPTIONAL_REASON: string;
  NO_OF_DAYS: number;
  STATUS: string;
  POOL: string;
  STATUS_CODE: string;
  OUT_OF_SERVICE: boolean;
  FROM_DATE_STR: string;
  TO_DATE_STR: string;
}

interface IglBookPropertyPayloadSplitBooking extends IglBookPropertyPayload {
  event_type: 'SPLIT_BOOKING';
  NO_OF_DAYS?: number;
  STATUS?: string;
  PR_ID?: string;
  ENTRY_DATE?: string;
  ADULTS_COUNT?: number;
  CHILDREN_COUNT?: number;
  GUEST?: {};
  ROOMS?: Array<{}>;
  TOTAL_PRICE?: number;
  COUNTRY?: number;
  RATE?: number;
  RATE_PLAN?: string;
  ARRIVAL_TIME?: string;
  roomsInfo?: Array<{}>;
  INTERNAL_NOTE?: string;
  BLOCK_DATES_TITLE?: string;
  splitBookingEvents?: boolean;
}

interface IglBookPropertyPayloadBlockDates extends IglBookPropertyPayload {
  event_type: 'BLOCK_DATES';
  BLOCK_DATES_TITLE?: string;
  STATUS?: string;
  PR_ID?: string;
  ENTRY_DATE?: string;
  NO_OF_DAYS?: number;
  RELEASE_AFTER_HOURS?: number;
  BALANCE?: string;
  NOTES?: string;
  ROOMS?: Array<{}>;
  GUEST?: {};
  TOTAL_PRICE?: number;
  COUNTRY?: number;
  RATE?: number;
  RATE_PLAN?: string;
  ARRIVAL_TIME?: string;
  INTERNAL_NOTE?: string;
  splitBookingEvents?: boolean;
}

export type TIglBookPropertyPayload =
  | IglBookPropertyPayloadBlockDates
  | IglBookPropertyPayloadSplitBooking
  | IglBookPropertyPayloadBarBooking
  | IglBookPropertyPayloadAddRoom
  | IglBookPropertyPayloadPlusBooking
  | IglBookPropertyPayloadEditBooking;
