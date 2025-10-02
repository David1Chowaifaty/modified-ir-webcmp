import { z } from 'zod';

import { RoomGuestsPayload } from '@/components/ir-booking-details/types';

export interface IRoomService {
  calendar_legends: CalendarLegend[];
  currency: Currency;
  id: number;
  name: string;
  roomtypes: RoomType[];
}

export interface CalendarLegend {
  color: string;
  design: string;
  id: string;
  name: string;
}

// export interface Currency {
//   code: string;
//   id: number;
// }

export interface RoomType {
  availabilities: number | null;
  id: number;
  inventory: number;
  name: string;
  physicalRooms: PhysicalRoom[];
  rate: number;
  ratePlans: RatePlan[];
  expanded: boolean;
}

export interface PhysicalRoom {
  calendarCell: null;
  id: number;
  name: string;
}

export interface RatePlan {
  id: number;
  name: string;
  rateRestrictions: null;
}

export interface IReallocationPayload {
  pool: string;
  toRoomId: number;
  from_date: string;
  to_date: string;
  title: string;
  description: string;
  hideConfirmButton?: boolean;
}
export interface IRoomNightsDataEventPayload {
  type: 'cancel' | 'confirm';
  pool: string;
}
export interface IRoomNightsData {
  booking: any;
  bookingNumber: string;
  identifier: string;
  to_date: string;
  pool: string;
  from_date: string;
  defaultDates: { from_date: string; to_date: string };
}

export type CalendarModalReason = 'checkin' | 'checkout' | 'reallocate' | null | 'stretch' | 'squeeze';

export type CalendarModalEvent = CheckinCheckoutEventPayload | ReallocateEventPayload | StretchEventPayload;

type CheckinCheckoutEventPayload =
  | {
      reason: 'checkin';
      bookingNumber: string;
      roomIdentifier: string;
      roomUnit: string;
      roomName: string;
      sidebarPayload: RoomGuestsPayload & { bookingNumber: string };
    }
  | {
      reason: 'checkout';
      bookingNumber: string;
      roomIdentifier: string;
      roomUnit: string;
      roomName: string;
    };

type ReallocateEventPayload = {
  reason: 'reallocate';
  ratePlans?: RatePlan[];
} & IReallocationPayload;
type StretchEventPayload = {
  reason: 'stretch';
} & IRoomNightsData;

export const LanguageSchema = z.object({
  code: z.string(),
  culture: z.null(),
  description: z.string(),
  direction: z.null(),
  entries: z.null(),
  flag: z.null(),
  id: z.number(),
});
export type Language = z.infer<typeof LanguageSchema>;

export const LocalizableSchema = z.object({
  code: z.string(),
  description: z.string(),
  id: z.number(),
  language: LanguageSchema,
});
export type Localizable = z.infer<typeof LocalizableSchema>;

export const OptionSchema = z.object({
  code: z.string(),
  description: z.string(),
});
export type Option = z.infer<typeof OptionSchema>;

export const AllowedBookingSourceSchema = z.object({
  code: z.string(),
  description: z.string(),
  id: z.string(),
  tag: z.string(),
  type: z.string(),
});
export type AllowedBookingSource = z.infer<typeof AllowedBookingSourceSchema>;

export const AllowedCardSchema = z.object({
  id: z.number(),
  name: z.string(),
});
export type AllowedCard = z.infer<typeof AllowedCardSchema>;

export const CurrencySchema = z.object({
  code: z.string(),
  id: z.number(),
  symbol: z.string(),
});
export type Currency = z.infer<typeof CurrencySchema>;

export const AllowedLocationSchema = z.object({
  description: z.string(),
  id: z.number(),
});
export type AllowedLocation = z.infer<typeof AllowedLocationSchema>;

export const VehicleSchema = z.object({
  capacity: z.number(),
  code: z.string(),
  description: z.string(),
});
export type Vehicle = z.infer<typeof VehicleSchema>;

export const AllowedOptionSchema = z.object({
  amount: z.number(),
  currency: CurrencySchema,
  id: z.number(),
  location: AllowedLocationSchema,
  pricing_model: OptionSchema,
  vehicle: VehicleSchema,
});
export type AllowedOption = z.infer<typeof AllowedOptionSchema>;

export const AmenitySchema = z.object({
  amenity_type: z.string(),
  code: z.string(),
  description: z.string(),
});
export type Amenity = z.infer<typeof AmenitySchema>;

export const ExtraInfoSchema = z.object({
  key: z.string(),
  value: z.string(),
});
export type ExtraInfo = z.infer<typeof ExtraInfoSchema>;

export const DescriptionSchema = z.object({
  food_and_beverage: z.string(),
  important_info: z.string(),
  location_and_intro: z.string(),
  non_standard_conditions: z.string(),
  rooming: z.string(),
});
export type Description = z.infer<typeof DescriptionSchema>;

export const CitySchema = z.object({
  gmt_offset: z.number(),
  id: z.number(),
  name: z.string(),
});
export type City = z.infer<typeof CitySchema>;

export const CountrySchema = z.object({
  cities: z.null(),
  code: z.null(),
  currency: z.null(),
  flag: z.null(),
  gmt_offset: z.number(),
  id: z.number(),
  name: z.string(),
  phone_prefix: z.string(),
});
export type Country = z.infer<typeof CountrySchema>;

export const ContactSchema = z.object({
  email: z.string(),
  mobile: z.null(),
  name: z.string(),
  phone: z.string(),
  type: z.string(),
});
export type Contact = z.infer<typeof ContactSchema>;

export const PropertyCalendarLegendSchema = z.object({
  color: z.string(),
  design: z.string(),
  id: z.string(),
  name: z.string(),
});
export type PropertyCalendarLegend = z.infer<typeof PropertyCalendarLegendSchema>;

export const BabyCotOfferingSchema = z.object({
  rate_per_night: z.number(),
  title: z.string(),
});
export type BabyCotOffering = z.infer<typeof BabyCotOfferingSchema>;

export const SocialMediaSchema = z.object({
  code: z.string(),
  link: z.string(),
  name: z.string(),
});
export type SocialMedia = z.infer<typeof SocialMediaSchema>;

export const SpaceThemeSchema = z.object({
  background_image: z.string(),
  button_bg_color: z.string(),
  button_border_radius: z.string(),
  favicon: z.string(),
  heading_bar_color: z.string(),
  heading_font_color: z.string(),
  logo: z.string(),
  website: z.string(),
});
export type SpaceTheme = z.infer<typeof SpaceThemeSchema>;

export const TaxSchema = z.object({
  is_exlusive: z.boolean(),
  name: z.string(),
  pct: z.number(),
});
export type Tax = z.infer<typeof TaxSchema>;

export const TimeConstraintsSchema = z.object({
  booking_cutoff: z.string(),
  check_in_from: z.string(),
  check_in_till: z.string(),
  check_out_till: z.string(),
});
export type TimeConstraints = z.infer<typeof TimeConstraintsSchema>;

export const PropertyImageSchema = z.object({
  thumbnail: z.string(),
  tooltip: z.string().nullable(),
  url: z.string(),
});
export type PropertyImage = z.infer<typeof PropertyImageSchema>;

export const RoomImageSchema = z.object({
  thumbnail: z.string(),
  tooltip: z.string(),
  url: z.string(),
});
export type RoomImage = z.infer<typeof RoomImageSchema>;

export const MainImageSchema = z.object({
  thumbnail: z.null(),
  tooltip: z.string(),
  url: z.string(),
});
export type MainImage = z.infer<typeof MainImageSchema>;

export const BeddingSetupSchema = z.object({
  code: z.string(),
  count: z.number(),
  name: z.string(),
});
export type BeddingSetup = z.infer<typeof BeddingSetupSchema>;

export const RatePlanAgentSchema = z.object({
  code: z.string(),
  id: z.number(),
  is_active: z.null(),
  name: z.string(),
  payment_mode: z.null(),
  verification_mode: z.null(),
});
export type RatePlanAgent = z.infer<typeof RatePlanAgentSchema>;

export const MealPlanSchema = z.object({
  code: z.string(),
  name: z.string(),
});
export type MealPlan = z.infer<typeof MealPlanSchema>;

export const PropertyHousekeeperSchema = z.object({
  assigned_units: z.null(),
  id: z.number(),
  is_active: z.boolean(),
  is_soft_deleted: z.boolean(),
  mobile: z.null(),
  name: z.string(),
  note: z.null(),
  password: z.null(),
  phone_prefix: z.null(),
  property_id: z.number(),
  username: z.null(),
});
export type PropertyHousekeeper = z.infer<typeof PropertyHousekeeperSchema>;

export const PropertyPhysicalRoomSchema = z.object({
  calendar_cell: z.null(),
  hk_status: z.enum(['001', '002', '003', '004']).nullable(),
  housekeeper: PropertyHousekeeperSchema.nullable(),
  id: z.number(),
  is_active: z.boolean(),
  name: z.string(),
});
export type PropertyPhysicalRoom = z.infer<typeof PropertyPhysicalRoomSchema>;

export const OccupancyMaxSchema = z.object({
  adult_nbr: z.number(),
  children_nbr: z.number(),
  infant_nbr: z.number(),
});
export type OccupancyMax = z.infer<typeof OccupancyMaxSchema>;

export const OccupancyDefaultSchema = z.object({
  adult_nbr: z.number(),
  children_nbr: z.number(),
  infant_nbr: z.null(),
});
export type OccupancyDefault = z.infer<typeof OccupancyDefaultSchema>;

export const SmokingOptionSchema = z.object({
  allowed_smoking_options: z.array(OptionSchema),
  code: z.string(),
  description: z.string(),
});
export type SmokingOption = z.infer<typeof SmokingOptionSchema>;

export const VariationSchema = z.object({
  adult_child_offering: z.string(),
  adult_nbr: z.number(),
  amount: z.coerce.number(),
  child_nbr: z.number(),
});
export type Variation = z.infer<typeof VariationSchema>;
export const PropertyRatePlanSchema = z.object({
  agents: z.array(RatePlanAgentSchema),
  assignable_units: z.null(),
  cancelation: z.string().nullable(),
  custom_text: z.string().nullable(),
  extra_bed_for_code: z.string(),
  extra_bed_max: z.number(),
  extra_bed_rate_per_night: z.number(),
  extra_bed_rate_per_night_additional_child: z.number(),
  extra_bed_rate_per_night_first_child: z.number(),
  guarantee: z.string().nullable(),
  id: z.number(),
  is_active: z.boolean(),
  is_available_to_book: z.boolean(),
  is_booking_engine_enabled: z.boolean(),
  is_channel_enabled: z.boolean(),
  is_closed: z.null(),
  is_derived: z.boolean(),
  is_extra_bed_free_for_children: z.boolean(),
  is_non_refundable: z.boolean(),
  is_targeting_travel_agency: z.boolean(),
  meal_plan: MealPlanSchema,
  name: z.string(),
  not_available_reason: z.null(),
  pre_payment_amount: z.null(),
  pre_payment_amount_gross: z.null(),
  rate_restrictions: z.null(),
  selected_variation: VariationSchema.nullable(),
  sell_mode: OptionSchema,
  short_name: z.string(),
  sleeps: z.number(),
  variations: z.array(VariationSchema).nullable(),
});
export type PropertyRatePlan = z.infer<typeof PropertyRatePlanSchema>;

export const PropertyRoomTypeSchema = z.object({
  amenities: z.array(AmenitySchema),
  availabilities: z.null(),
  bedding_setup: z.array(BeddingSetupSchema),
  description: z.string(),
  exposed_inventory: z.null(),
  id: z.number(),
  images: z.array(RoomImageSchema),
  inventory: z.null(),
  is_active: z.boolean(),
  is_available_to_book: z.null(),
  is_bed_configuration_enabled: z.boolean(),
  main_image: MainImageSchema,
  name: z.string(),
  not_available_reason: z.null(),
  occupancy_default: OccupancyDefaultSchema,
  occupancy_max: OccupancyMaxSchema,
  physicalrooms: z.array(PropertyPhysicalRoomSchema),
  rate: z.null(),
  rateplans: z.array(PropertyRatePlanSchema),
  size: z.number(),
  smoking_option: SmokingOptionSchema,
});
export type PropertyRoomType = z.infer<typeof PropertyRoomTypeSchema>;

export const AllowedPaymentMethodSchema = z.object({
  allowed_currencies: z.string().nullable(),
  code: z.string(),
  data: z.null(),
  description: z.string(),
  display_order: z.null(),
  id: z.number().nullable(),
  img_url: z.string().nullable(),
  is_active: z.boolean(),
  is_payment_gateway: z.boolean(),
  localizables: z.array(LocalizableSchema).nullable(),
  property_id: z.number(),
});
export type AllowedPaymentMethod = z.infer<typeof AllowedPaymentMethodSchema>;

export const PickupServiceSchema = z.object({
  allowed_locations: z.array(AllowedLocationSchema),
  allowed_options: z.array(AllowedOptionSchema),
  allowed_pricing_models: z.array(OptionSchema),
  allowed_vehicle_types: z.array(VehicleSchema),
  is_enabled: z.boolean(),
  is_not_allowed_on_same_day: z.boolean(),
  pickup_cancelation_prepayment: OptionSchema,
  pickup_instruction: OptionSchema,
});
export type PickupService = z.infer<typeof PickupServiceSchema>;

export const InternetOfferingSchema = z.object({
  is_public_internet_free: z.boolean(),
  is_room_internet_free: z.boolean(),
  public_internet_statement: z.string(),
  room_internet_statement: z.string(),
  room_rate_per_24_hour: z.number(),
  room_rate_per_hour: z.number(),
});
export type InternetOffering = z.infer<typeof InternetOfferingSchema>;

export const LocationSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
});
export type Location = z.infer<typeof LocationSchema>;

export const PetsAcceptanceSchema = z.object({
  title: z.string(),
});
export type PetsAcceptance = z.infer<typeof PetsAcceptanceSchema>;

export const ParkingOfferingSchema = z.object({
  pricing: z.number(),
  schedule: z.string(),
  title: z.string(),
});
export type ParkingOffering = z.infer<typeof ParkingOfferingSchema>;

export const AgentSchema = z.object({
  code: z.string(),
  id: z.number(),
  is_active: z.boolean(),
  name: z.string(),
  payment_mode: OptionSchema,
  verification_mode: z.string(),
});
export type Agent = z.infer<typeof AgentSchema>;

export const AdultChildConstraintsSchema = z.object({
  adult_max_nbr: z.number(),
  child_max_age: z.number(),
  child_max_nbr: z.number(),
});
export type AdultChildConstraints = z.infer<typeof AdultChildConstraintsSchema>;

export const BookingColorSchema = z.object({
  color: z.string(),
  design: z.literal('skew'),
  name: z.string(),
});

export type BookingColor = z.infer<typeof BookingColorSchema>;

export const PropertySchema = z.object({
  address: z.string(),
  adult_child_constraints: AdultChildConstraintsSchema,
  affiliates: z.array(z.any()),
  agents: z.array(AgentSchema),
  allowed_booking_sources: z.array(AllowedBookingSourceSchema),
  allowed_cards: z.array(AllowedCardSchema),
  allowed_payment_methods: z.array(AllowedPaymentMethodSchema),
  amenities: z.array(AmenitySchema),
  aname: z.string(),
  area: z.string(),
  baby_cot_offering: BabyCotOfferingSchema,
  be_listing_mode: z.string(),
  calendar_extra: z.preprocess(
    val => (typeof val === 'string' ? JSON.parse(val) : val),
    z
      .object({
        booking_colors: z.array(BookingColorSchema),
      })
      .nullable(),
  ),
  calendar_legends: z.array(PropertyCalendarLegendSchema),
  city: CitySchema,
  cleaning_frequency: OptionSchema,
  contacts: z.array(ContactSchema),
  country: CountrySchema,
  currency: CurrencySchema,
  description: DescriptionSchema,
  extra_info: z.array(ExtraInfoSchema),
  id: z.number(),
  images: z.array(PropertyImageSchema),
  internet_offering: InternetOfferingSchema,
  is_automatic_check_in_out: z.boolean(),
  is_be_enabled: z.boolean(),
  is_frontdesk_enabled: z.boolean(),
  is_multi_property: z.boolean(),
  is_pms_enabled: z.boolean(),
  is_vacation_rental: z.boolean(),
  location: LocationSchema,
  max_nights: z.number(),
  name: z.string(),
  parking_offering: ParkingOfferingSchema,
  payment_methods: z.null(),
  perma_link: z.string(),
  pets_acceptance: PetsAcceptanceSchema,
  phone: z.string(),
  pickup_service: PickupServiceSchema,
  postal: z.null(),
  privacy_policy: z.string(),
  promotions: z.array(z.any()),
  registered_name: z.string(),
  roomtypes: z.array(PropertyRoomTypeSchema),
  social_media: z.array(SocialMediaSchema),
  sources: z.array(OptionSchema),
  space_theme: SpaceThemeSchema,
  tags: z.array(ExtraInfoSchema),
  tax_nbr: z.string(),
  tax_statement: z.string(),
  taxation_strategy: OptionSchema,
  taxes: z.array(TaxSchema),
  time_constraints: TimeConstraintsSchema,
});
export type Property = z.infer<typeof PropertySchema>;
