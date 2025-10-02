import { z } from 'zod';

import {
  AllowedLocation,
  AllowedLocationSchema,
  Country,
  Currency,
  CurrencySchema,
  Option,
  OptionSchema,
  PropertyPhysicalRoomSchema,
  PropertyRatePlanSchema,
  PropertyRoomTypeSchema,
  PropertySchema,
  Vehicle,
  VehicleSchema,
} from './property-types';

const NullableString = z.string().nullable();
const NullableNumber = z.number().nullable();

export const IdTypeSchema = z.object({
  code: z.string(),
  description: z.string(),
});
export type IdType = z.infer<typeof IdTypeSchema>;

export const IdInfoSchema = z.object({
  type: IdTypeSchema,
  number: z.string(),
});
export type IdInfo = z.infer<typeof IdInfoSchema>;

export const OtaGuaranteeMetaSchema = z.object({
  virtual_card_currency_code: z.string(),
  virtual_card_current_balance: z.string(),
  virtual_card_decimal_places: z.string(),
  virtual_card_effective_date: z.string(),
  virtual_card_expiration_date: z.string(),
});
export type OtaGuaranteeMeta = z.infer<typeof OtaGuaranteeMetaSchema>;

export const OtaGuaranteeSchema = z.object({
  card_number: z.string(),
  card_type: z.string(),
  cardholder_name: z.string(),
  cvv: z.string(),
  expiration_date: z.string(),
  is_virtual: z.boolean(),
  meta: OtaGuaranteeMetaSchema,
  token: z.string(),
});
export type OtaGuarantee = z.infer<typeof OtaGuaranteeSchema>;

export const OtaServiceSchema = z.object({
  name: z.string(),
  nights: z.number(),
  persons: z.number(),
  price_mode: z.string(),
  price_per_unit: z.number(),
  total_price: z.number(),
});
export type OtaService = z.infer<typeof OtaServiceSchema>;

export const ExposedBookingEventSchema = z.object({
  date: z.string(),
  hour: z.number(),
  id: z.number().nullable(),
  minute: z.number(),
  second: z.number(),
  type: z.string(),
  user: z.string(),
});
export type ExposedBookingEvent = z.infer<typeof ExposedBookingEventSchema>;

export const OtaManipulationSchema = z.object({
  user: z.string(),
  date: z.string(),
  hour: z.string(),
  minute: z.string(),
});
export type OtaManipulation = z.infer<typeof OtaManipulationSchema>;

export const BypassedOtaRevisionSchema = z.object({
  revision_nbr: z.number(),
  date: z.string(),
  revision_type: z.string(),
});
export type BypassedOtaRevision = z.infer<typeof BypassedOtaRevisionSchema>;

export const ExtraServiceSchema = z.object({
  booking_system_id: z.number().optional(),
  cost: NullableNumber,
  currency_id: z.number(),
  description: z.string(),
  end_date: NullableString,
  price: z.number(),
  start_date: NullableString,
  system_id: z.number().optional(),
});
export type ExtraService = z.infer<typeof ExtraServiceSchema>;

export const ExtraSchema = z.object({
  key: z.string(),
  value: z.unknown(),
});
export type Extra = z.infer<typeof ExtraSchema>;

export const OtaNoteSchema = z.object({
  statement: z.string(),
});
export type OtaNote = z.infer<typeof OtaNoteSchema>;

export const PickupPricingModelSchema = z.object({
  code: z.string(),
  description: z.string(),
});
export type PickupPricingModel = z.infer<typeof PickupPricingModelSchema>;

export const PickupSelectedOptionSchema = z.object({
  amount: z.number(),
  currency: CurrencySchema,
  id: z.number(),
  location: AllowedLocationSchema,
  pricing_model: PickupPricingModelSchema,
  vehicle: VehicleSchema,
});
export type PickupSelectedOption = z.infer<typeof PickupSelectedOptionSchema>;

export const BookingPickupInfoSchema = z.object({
  currency: CurrencySchema,
  date: z.string(),
  details: z.string(),
  hour: z.number(),
  minute: z.number(),
  nbr_of_units: z.number(),
  selected_option: PickupSelectedOptionSchema,
  total: z.number(),
});
export type BookingPickupInfo = z.infer<typeof BookingPickupInfoSchema>;

export const AllowedActionSchema = z.object({
  code: z.string(),
  description: z.string(),
});
export type AllowedAction = z.infer<typeof AllowedActionSchema>;

export const DueDateSchema = z.object({
  amount: z.number(),
  currencysymbol: z.string(),
  date: z.string(),
  description: z.string(),
  room: z.string(),
});
export type DueDate = z.infer<typeof DueDateSchema>;

export const PaymentTypeSchema = z.object({
  code: z.string(),
  description: z.string(),
  operation: z.string().nullable().optional(),
});
export type PaymentType = z.infer<typeof PaymentTypeSchema>;

export const PaymentTimestampSchema = z.object({
  date: z.string().optional(),
  hour: z.number().optional(),
  minute: z.number().optional(),
  second: z.number().optional(),
  user: z.string().optional(),
});
export type PaymentTimestamp = z.infer<typeof PaymentTimestampSchema>;

export const PaymentSchema = z.object({
  id: z.number().nullable(),
  date: z.string(),
  amount: z.number(),
  currency: CurrencySchema,
  designation: z.string(),
  reference: z.string(),
  book_nbr: z.string().optional(),
  payment_gateway_code: z.number().nullable().optional(),
  payment_type: PaymentTypeSchema.optional(),
  payment_method: PaymentTypeSchema.optional(),
  time_stamp: PaymentTimestampSchema.nullable().optional(),
});
export type Payment = z.infer<typeof PaymentSchema>;

export const FinancialSchema = z.object({
  cancelation_penality_as_if_today: z.number(),
  due_amount: z.number(),
  due_dates: z.array(DueDateSchema).nullable(),
  payments: z.array(PaymentSchema).nullable(),
  total_amount: z.number(),
  collected: z.number(),
  gross_total: z.number(),
  gross_cost: z.number(),
  invoice_nbr: z.string(),
});
export type Financial = z.infer<typeof FinancialSchema>;

export const FormatSchema = z.object({
  from_date: z.string(),
  to_date: z.string(),
});
export type Format = z.infer<typeof FormatSchema>;

export const ArrivalSchema = z.object({
  code: z.string(),
  description: z.string(),
});
export type Arrival = z.infer<typeof ArrivalSchema>;

export const DateTimeSchema = z.object({
  date: z.string(),
  hour: z.number(),
  minute: z.number(),
});
export type DateTime = z.infer<typeof DateTimeSchema>;

export const CCISchema = z.object({
  nbr: z.union([z.string(), z.number()]),
  holder_name: z.string(),
  expiry_month: z.coerce.number(),
  expiry_year: z.coerce.number(),
  cvc: z.string().nullable().optional(),
});
export type CCI = z.infer<typeof CCISchema>;

export const PersonSchema = z.object({
  address: NullableString,
  city: NullableString,
  country_id: NullableNumber,
  dob: NullableString,
  email: NullableString,
  id: z.number().nullable(),
  first_name: z.string(),
  last_name: NullableString,
  full_name: z.string().optional().nullable(),
  mobile: NullableString,
  country_phone_prefix: NullableString,
  subscribe_to_news_letter: z.boolean().nullable(),
  cci: CCISchema.nullable().optional(),
  alternative_email: NullableString.optional(),
  nbr_confirmed_bookings: z.number().default(0),
  notes: z.string().optional().nullable(),
  mobile_without_prefix: z.string().nullable(),
  password: z.string().optional().nullable(),
});
export type Person = z.infer<typeof PersonSchema>;

export const SharedPersonSchema = PersonSchema.extend({
  is_main: z.boolean(),
  id_info: IdInfoSchema,
});
export type SharedPerson = z.infer<typeof SharedPersonSchema>;

export const OccupancySchema = z.object({
  adult_nbr: z.number(),
  children_nbr: z.number(),
  infant_nbr: NullableNumber,
});
export type Occupancy = z.infer<typeof OccupancySchema>;

export const OriginSchema = z.object({
  Icon: z.string(),
  Label: z.string(),
});
export type Origin = z.infer<typeof OriginSchema>;

export const DepartureTimeSchema = z.object({
  code: z.string(),
  description: z.string(),
});
export type DepartureTime = z.infer<typeof DepartureTimeSchema>;

export const BracketSchema = z.object({
  amount: z.number(),
  amount_formatted: z.string(),
  code: z.string(),
  currency_id: z.number(),
  due_on: z.string(),
  due_on_formatted: NullableString,
  gross_amount: z.number(),
  gross_amount_formatted: z.string(),
  statement: z.string(),
});
export type Bracket = z.infer<typeof BracketSchema>;

export const ExposedApplicablePolicySchema = z.object({
  brackets: z.array(BracketSchema),
  combined_statement: z.string(),
  type: z.enum(['cancelation', 'guarantee']),
});
export type ExposedApplicablePolicy = z.infer<typeof ExposedApplicablePolicySchema>;

export const RoomInOutSchema = z.object({
  code: z.enum(['001', '002', '000']),
  description: z.string(),
});
export type RoomInOut = z.infer<typeof RoomInOutSchema>;

export const OtaMetaSchema = z.object({
  bed_preferences: NullableString,
  meal_plan: NullableString,
  parent_rate_plan_id: NullableString,
  policies: NullableString,
  smoking_preferences: NullableString,
});
export type OtaMeta = z.infer<typeof OtaMetaSchema>;

export const OtaTaxCurrencySchema = z.object({
  code: z.string(),
  id: z.number(),
  symbol: z.string(),
});
export type OtaTaxCurrency = z.infer<typeof OtaTaxCurrencySchema>;

export const OtaTaxSchema = z.object({
  amount: z.number(),
  currency: OtaTaxCurrencySchema,
  is_exlusive: z.boolean(),
  name: z.string(),
});
export type OtaTax = z.infer<typeof OtaTaxSchema>;

export const UnitSchema = z.object({
  calendar_cell: z.null(),
  id: z.number(),
  name: z.string(),
});
export type Unit = z.infer<typeof UnitSchema>;

export const RoomSchema = z.object({
  days: z.array(z.object({ amount: z.number(), date: z.string(), cost: NullableNumber })),
  applicable_policies: z.array(ExposedApplicablePolicySchema),
  from_date: z.string(),
  calendar_extra: z.string(),
  guest: PersonSchema,
  occupancy_default: z.number().nullable().optional(),
  notes: NullableString,
  occupancy: OccupancySchema,
  physicalroom: PropertyPhysicalRoomSchema.optional(),
  in_out: RoomInOutSchema.nullable(),
  sharing_persons: z.array(SharedPersonSchema).nullable(),
  bed_preference: NullableNumber,
  rateplan: PropertyRatePlanSchema,
  roomtype: PropertyRoomTypeSchema,
  departure_time: DepartureTimeSchema,
  to_date: z.string(),
  total: z.number(),
  smoking_option: z.string().nullable(),
  identifier: z.string(),
  unit: UnitSchema.nullable(),
  ota_taxes: z.array(OtaTaxSchema).nullable(),
  ota_meta: OtaMetaSchema.nullable(),
  cost: NullableNumber,
  gross_cost: z.number().nullable(),
  gross_total: z.number(),
  guarantee: z.number(),
  gross_guarantee: z.number(),
});
export type Room = z.infer<typeof RoomSchema>;

export const SourceSchema = OptionSchema.extend({
  tag: NullableString,
  description: NullableString,
  code: NullableString,
});
export type Source = z.infer<typeof SourceSchema>;

export const StatusSchema = OptionSchema;
export type Status = z.infer<typeof StatusSchema>;

export const AgentSchema = z.object({
  code: z.string(),
  id: z.number(),
  name: z.string(),
  verification_mode: z.null(),
});
export type Agent = z.infer<typeof AgentSchema>;

export const BookingSchema = z.object({
  agent: AgentSchema.nullable(),
  events: z.array(ExposedBookingEventSchema),
  ota_manipulations: z.array(OtaManipulationSchema).nullable(),
  bypassed_ota_revisions: z.array(BypassedOtaRevisionSchema).nullable(),
  ota_services: z.array(OtaServiceSchema).nullable(),
  ota_guarante: OtaGuaranteeSchema.nullable(),
  ota_notes: z.array(OtaNoteSchema).nullable(),
  is_requested_to_cancel: z.boolean().nullable(),
  arrival: ArrivalSchema,
  allowed_actions: z.array(AllowedActionSchema),
  system_id: z.number(),
  booked_on: DateTimeSchema,
  booking_nbr: z.string(),
  currency: CurrencySchema,
  extra_services: z.array(ExtraServiceSchema).nullable(),
  from_date: z.string(),
  guest: PersonSchema,
  extras: z.array(ExtraSchema).nullable(),
  occupancy: OccupancySchema,
  origin: OriginSchema,
  property: PropertySchema,
  remark: z.string(),
  rooms: z.array(RoomSchema),
  source: SourceSchema,
  status: StatusSchema,
  to_date: z.string(),
  total: z.number(),
  is_editable: z.boolean(),
  format: FormatSchema,
  channel_booking_nbr: NullableString,
  is_direct: z.boolean(),
  financial: FinancialSchema,
  pickup_info: BookingPickupInfoSchema.nullable(),
  cost: NullableNumber,
  is_pms_enabled: z.boolean(),
  promo_key: NullableString,
  is_in_loyalty_mode: z.boolean().nullable(),
});
export type Booking = z.infer<typeof BookingSchema>;

export { AllowedLocation, Country, Currency, Option, Vehicle };
