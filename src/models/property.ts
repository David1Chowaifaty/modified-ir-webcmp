export interface IProperty {
  address: string;
  adult_child_constraints: Adultchildconstraints;
  affiliates: any[];
  agents: Agent[];
  allowed_booking_sources: Allowedbookingsource[];
  allowed_cards: Allowedcard[];
  allowed_payment_methods: Allowedpaymentmethod[];
  amenities: Amenity[];
  aname: string;
  area: string;
  baby_cot_offering: Babycotoffering;
  calendar_legends: Calendarlegend[];
  city: Allowedcard;
  contacts: Contact[];
  country: Country;
  currency: Currency;
  description: Description;
  id: number;
  images: Image[];
  internet_offering: Internetoffering;
  is_be_enabled: boolean;
  is_frontdesk_enabled: boolean;
  is_pms_enabled: boolean;
  is_vacation_rental: boolean;
  location: Location;
  max_nights: number;
  name: string;
  parking_offering: Parkingoffering;
  payment_methods: null;
  perma_link: string;
  pets_acceptance: Petsacceptance;
  phone: string;
  pickup_service: Pickupservice;
  postal: null;
  privacy_policy: string;
  promotions: Promotion[];
  roomtypes: Roomtype[];
  social_media: Socialmedia[];
  space_theme: Spacetheme;
  tags: Tag[];
  tax_nbr: string;
  tax_statement: string;
  taxes: Tax[];
  time_constraints: Timeconstraints;
}

export interface Timeconstraints {
  booking_cutoff: string;
  check_in_from: string;
  check_in_till: string;
  check_out_till: string;
}

export interface Tax {
  is_exlusive: boolean;
  name: string;
  pct: number;
}

export interface Tag {
  key: string;
  value: string;
}

export interface Spacetheme {
  background_image: string;
  button_bg_color: string;
  button_border_radius: string;
  favicon: string;
  heading_bar_color: string;
  heading_font_color: string;
  logo: string;
  website: string;
}

export interface Socialmedia {
  code: string;
  link: string;
  name: string;
}

export interface Roomtype {
  amenities: Amenity[];
  availabilities: null;
  bedding_setup: Beddingsetup[];
  description: string;
  exposed_inventory: null;
  id: number;
  images: Image2[];
  inventory: null;
  is_active: boolean;
  is_bed_configuration_enabled: boolean;
  main_image: Image2 | null;
  name: string;
  occupancy_default: Occupancydefault;
  occupancy_max: Occupancymax;
  physicalrooms: Physicalroom[];
  pre_payment_amount: null;
  rate: null;
  rateplans: Rateplan[];
  size: number;
  smoking_option: Smokingoption;
}

export interface Smokingoption {
  allowed_smoking_options: Pricingmodel[];
  code: string;
  description: string;
}

export interface Rateplan {
  assignable_units: null;
  cancelation: null;
  custom_text: null;
  guarantee: null;
  id: number;
  is_active: boolean;
  is_booking_engine_enabled: boolean;
  is_channel_enabled: boolean;
  is_closed: null;
  is_non_refundable: boolean;
  is_targeting_travel_agency: boolean;
  name: string;
  rate_restrictions: null;
  selected_variation: null;
  sell_mode: Pricingmodel;
  short_name: string;
  variations: null;
}

export interface Physicalroom {
  calendar_cell: null;
  housekeeper: Housekeeper | null;
  id: number;
  name: string;
}

export interface Housekeeper {
  assigned_units: null;
  id: number;
  is_active: boolean;
  is_soft_deleted: boolean;
  mobile: null;
  name: string;
  note: null;
  password: null;
  phone_prefix: null;
  property_id: number;
  username: null;
}

export interface Occupancymax {
  adult_nbr: number;
  children_nbr: number;
  infant_nbr: number;
}

export interface Occupancydefault {
  adult_nbr: number;
  children_nbr: number;
  infant_nbr: null;
}

export interface Image2 {
  tooltip: string;
  url: string;
}

export interface Beddingsetup {
  code: string;
  count: number;
  name: string;
}

export interface Promotion {
  from: string;
  id: number;
  is_loyalty: boolean;
  key: string;
  to: string;
}

export interface Pickupservice {
  allowed_locations: Allowedlocation[];
  allowed_options: Allowedoption[];
  allowed_pricing_models: Pricingmodel[];
  allowed_vehicle_types: Vehicle[];
  is_enabled: boolean;
  is_not_allowed_on_same_day: boolean;
  pickup_cancelation_prepayment: Pricingmodel;
  pickup_instruction: Pricingmodel;
}

export interface Allowedoption {
  amount: number;
  currency: Currency;
  id: number;
  location: Allowedlocation;
  pricing_model: Pricingmodel;
  vehicle: Vehicle;
}

export interface Vehicle {
  capacity: number;
  code: string;
  description: string;
}

export interface Pricingmodel {
  code: string;
  description: string;
}

export interface Allowedlocation {
  description: string;
  id: number;
}

export interface Petsacceptance {
  title: string;
}

export interface Parkingoffering {
  pricing: number;
  schedule: string;
  title: string;
}

export interface Location {
  latitude: number;
  longitude: number;
}

export interface Internetoffering {
  is_public_internet_free: boolean;
  is_room_internet_free: boolean;
  public_internet_statement: string;
  room_internet_statement: string;
  room_rate_per_24_hour: number;
  room_rate_per_hour: number;
}

export interface Image {
  tooltip: null;
  url: string;
}

export interface Description {
  food_and_beverage: string;
  important_info: string;
  location_and_intro: string;
  non_standard_conditions: string;
  rooming: string;
}

export interface Currency {
  code: string;
  id: number;
  symbol: string;
}

export interface Country {
  cities: null;
  code: null;
  currency: null;
  flag: null;
  id: number;
  name: string;
  phone_prefix: string;
}

export interface Contact {
  email: string;
  mobile: null;
  name: string;
  phone: string;
  type: string;
}

export interface Calendarlegend {
  color: string;
  design: string;
  id: string;
  name: string;
}

export interface Babycotoffering {
  rate_per_night: number;
  title: string;
}

export interface Amenity {
  amenity_type: string;
  code: string;
  description: string;
}

export interface Allowedpaymentmethod {
  code: string;
  data: null;
  description: string;
  id: null | number;
  is_active: boolean;
  is_payment_gateway: boolean;
  property_id: number;
}

export interface Allowedcard {
  id: number;
  name: string;
}

export interface Allowedbookingsource {
  code: string;
  description: string;
  id: string;
  tag: string;
  type: string;
}

export interface Agent {
  code: string;
  id: number;
  name: string;
  verification_mode: string;
}

export interface Adultchildconstraints {
  adult_max_nbr: number;
  child_max_age: number;
  child_max_nbr: number;
}

export interface MyParamsGetExposedProperty {
  aname: null;
  currency: null;
  id: number;
  include_sales_rate_plans: boolean;
  is_backend: boolean;
  language: string;
  perma_link: null;
}
