import * as z from 'zod';
import { Booking, ExtraService, IBookingPickupInfo, RoomInOut } from '@/models/booking.dto';
import { IEntries } from '@/models/IBooking';

const NumberOrStringSchema = z.union([z.number(), z.string().optional()]);

export const CurrencySchema = z.object({
  id: z.number(),
});
export type Currency = z.infer<typeof CurrencySchema>;

export const CurrencyWithCodeSchema = CurrencySchema.extend({
  code: z.string().optional(),
});
export type CurrencyWithCode = z.infer<typeof CurrencyWithCodeSchema>;

export const ItemSchema = z.object({
  amount: z.number(),
  type: z.string().optional(),
  key: z.union([z.number(), z.string().optional()]),
  description: z.string().optional().optional().default(''),
});
export type Item = z.infer<typeof ItemSchema>;

export const TargetSchema = z.object({
  code: z.string().optional(),
  description: z.string().optional(),
});
export type Target = z.infer<typeof TargetSchema>;

export const UnblockUnitByPeriodPropsSchema = z.object({
  unit_id: z.number(),
  from_date: z.string().optional(),
  to_date: z.string().optional(),
});
export type UnblockUnitByPeriodProps = z.infer<typeof UnblockUnitByPeriodPropsSchema>;

export const GetNextValuePropsSchema = z.object({
  starter: z.string().optional(),
});
export type GetNextValueProps = z.infer<typeof GetNextValuePropsSchema>;

export const GetExposedApplicablePoliciesPropsSchema = z.object({
  booking_nbr: z.string().optional(),
  currency_id: z.number(),
  language: z.string().optional().optional(),
  rate_plan_id: z.number(),
  room_type_id: z.number(),
  property_id: z.number(),
  is_preserve_history: z.boolean().optional(),
  room_identifier: z.string().optional().optional(),
});
export type GetExposedApplicablePoliciesProps = z.infer<typeof GetExposedApplicablePoliciesPropsSchema>;

export const HandleExposedRoomInOutPropsSchema = z.object({
  booking_nbr: z.string().optional(),
  room_identifier: z.string().optional(),
  status: z.string().optional(),
});
export type HandleExposedRoomInOutProps = z.infer<typeof HandleExposedRoomInOutPropsSchema> & { status: RoomInOut['code'] };

export const GetPenaltyStatementPropsSchema = z.object({
  booking_nbr: z.string().optional(),
  currency_id: z.number(),
  language: z.string().optional(),
});
export type GetPenaltyStatementProps = z.infer<typeof GetPenaltyStatementPropsSchema>;

const RestrictionSchema = z.object({
  room_type_id: NumberOrStringSchema,
  night: z.string().optional(),
});

export const SetExposedRestrictionPerRoomTypePropsSchema = z.object({
  is_closed: z.boolean(),
  restrictions: z.array(RestrictionSchema),
  operation_type: z.string().optional().optional(),
});
export type SetExposedRestrictionPerRoomTypeProps = z.infer<typeof SetExposedRestrictionPerRoomTypePropsSchema>;

export const ChangeExposedBookingStatusPropsSchema = z.object({
  book_nbr: z.string().optional(),
  status: z.string().optional(),
});
export type ChangeExposedBookingStatusProps = z.infer<typeof ChangeExposedBookingStatusPropsSchema>;

const AdultChildCountSchema = z.object({
  adult: z.number(),
  child: z.number(),
});

export const GetBookingAvailabilityPropsSchema = z.object({
  from_date: z.string().optional(),
  to_date: z.string().optional(),
  propertyid: z.number(),
  adultChildCount: AdultChildCountSchema,
  language: z.string().optional(),
  room_type_ids: z.array(z.number()),
  room_type_ids_to_update: z.array(z.number()).optional(),
  rate_plan_ids: z.array(z.number()).optional(),
  currency: CurrencyWithCodeSchema,
  is_in_agent_mode: z.boolean().optional(),
  agent_id: NumberOrStringSchema.optional(),
});
export type GetBookingAvailabilityProps = z.infer<typeof GetBookingAvailabilityPropsSchema>;

const AvailabilityBracketSchema = z.object({
  from_date: z.string().optional(),
  to_date: z.string().optional(),
});

export const BlockAvailabilityForBracketsPropsSchema = z.object({
  unit_id: z.number(),
  block_status_code: z.enum(['003', '004', '002']).optional(),
  description: z.string().optional().optional(),
  property_id: z.number(),
  brackets: z.array(AvailabilityBracketSchema),
});
export type BlockAvailabilityForBracketsProps = z.infer<typeof BlockAvailabilityForBracketsPropsSchema>;

export const SetDepartureTimePropsSchema = z.object({
  property_id: z.number(),
  room_identifier: z.string().optional(),
  code: z.string().optional(),
});
export type SetDepartureTimeProps = z.infer<typeof SetDepartureTimePropsSchema>;

export const DoBookingExtraServicePropsSchema = z.object({
  service: z.custom<ExtraService>(),
  booking_nbr: NumberOrStringSchema,
  is_remove: z.boolean(),
});
export type DoBookingExtraServiceProps = z.infer<typeof DoBookingExtraServicePropsSchema>;

export interface IBookingProps {
  bookedByInfoData: any;
  check_in: boolean;
  fromDate: Date;
  toDate: Date;
  guestData;
  totalNights: number;
  source: { code: string; description: string };
  propertyid: number;
  rooms: any[];
  currency: { id: number; code: string };
  pickup_info: IBookingPickupInfo | null;
  bookingNumber?: string;
  defaultGuest?: any;
  arrivalTime?: any;
  pr_id?: number;
  identifier?: string;
  extras: { key: string; value: string }[] | null;
}

export type TableEntries =
  | '_CALENDAR_BLOCKED_TILL'
  | '_DEPARTURE_TIME'
  | '_ARRIVAL_TIME'
  | '_RATE_PRICING_MODE'
  | '_BED_PREFERENCE_TYPE'
  | '_PAY_TYPE'
  | '_PAY_TYPE_GROUP'
  | '_PAY_METHOD'
  | '_INVOICE_TARGET'
  | (string & {});

export type GroupedTableEntries = {
  [K in TableEntries as K extends `_${infer Rest}` ? Lowercase<Rest> : never]: IEntries[];
};
/*Arrivals */
export const GetRoomsToCheckInPropsSchema = z.object({
  property_id: z.string(),
  check_in_date: z.string(),
  page_index: z.number().default(1),
  page_size: z.number().default(10),
});
export type GetRoomsToCheckInProps = z.infer<typeof GetRoomsToCheckInPropsSchema>;
/*Departures */
export const GetRoomsToCheckOutPropsSchema = z.object({
  property_id: z.string(),
  check_out_date: z.string(),
  page_index: z.number().default(1),
  page_size: z.number().default(10),
});
export type GetRoomsToCheckOutProps = z.infer<typeof GetRoomsToCheckOutPropsSchema>;
export interface RoomsToProcessResult {
  bookings: Booking[];
  total_count: number;
}
/* INVOICE TYPES */

export const GetBookingInvoiceInfoPropsSchema = z.object({
  booking_nbr: z.string().optional(),
});
export type GetBookingInvoiceInfoProps = z.infer<typeof GetBookingInvoiceInfoPropsSchema>;

export const VoidInvoicePropsSchema = z.object({
  invoice_nbr: z.string().optional(),
  reason: z.string().optional(),
});

export const InvoiceSchema = z.object({
  booking_nbr: z.string().optional(),
  currency: CurrencySchema,
  target: TargetSchema,
  Date: z.string().optional(),
  nbr: z.string().optional(),
  remark: z.string().optional(),
  billed_to_name: z.string().optional(),
  billed_to_tax: z.string().optional(),
  items: z.array(ItemSchema),
});
export type Invoice = z.infer<typeof InvoiceSchema>;

export const IssueInvoicePropsSchema = z.object({
  is_proforma: z.boolean().optional().default(false),
  invoice: InvoiceSchema,
});
export type IssueInvoiceProps = z.infer<typeof IssueInvoicePropsSchema>;
export type VoidInvoiceProps = z.infer<typeof VoidInvoicePropsSchema>;

export const PrintInvoicePropsSchema = z.object({
  invoice_nbr: z.string().optional(),
  mode: z.enum(['invoice', 'creditnote', 'proforma']),
  invoice: InvoiceSchema.optional(),
});
export type PrintInvoiceProps = z.infer<typeof PrintInvoicePropsSchema>;

export const ExposedGuestSchema = z.object({
  address: z.null(),
  alternative_email: z.null(),
  cci: z.null(),
  city: z.null(),
  country: z.null(),
  country_id: z.number(),
  country_phone_prefix: z.string(),
  dob: z.null(),
  email: z.string(),
  first_name: z.string(),
  id: z.number(),
  id_info: z.null(),
  is_main: z.boolean(),
  last_name: z.string(),
  mobile: z.string(),
  mobile_without_prefix: z.string(),
  nbr_confirmed_bookings: z.number(),
  notes: z.null(),
  password: z.null(),
  subscribe_to_news_letter: z.null(),
});
export type ExposedGuest = z.infer<typeof ExposedGuestSchema>;

export const ExposedGuestsSchema = z.array(ExposedGuestSchema);
export type ExposedGuests = z.infer<typeof ExposedGuestsSchema>;
