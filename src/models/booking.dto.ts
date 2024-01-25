import { ICurrency } from './calendarData';

export interface Booking {
  arrival: Arrival;
  booked_on: DateTime;
  booking_nbr: string;
  currency: Currency;
  from_date: string;
  guest: Guest;
  occupancy: Occupancy;
  origin: Origin;
  property: Property;
  remark: string;
  rooms: Room[];
  source: Source;
  status: Status;
  to_date: string;
  total: number;
  is_editable: boolean;
  format: IFormat;
  channel_booking_nbr: string | null;
  is_direct: boolean;
  financial: IFinancials;
}
export interface IFinancials {
  due_amount: number;
  due_dates: IDueDate[];
  payments: IPayment[] | null;
}
export interface IPayment {
  id: number | null;
  date: string;
  amount: number;
  currency: ICurrency;
  designation: string;
  reference: string;
}
export interface IDueDate {
  amount: number;
  currencysymbol: string;
  date: string;
  description: string;
  room: string;
}
export interface IFormat {
  from_date: string;
  to_date: string;
}
export interface Arrival {
  code: string;
  description: string;
}

export interface DateTime {
  date: string;
  hour: number;
  minute: number;
}

export interface Currency {
  code: string;
  id: number;
}

export interface Guest {
  address: string | null;
  city: string | null;
  country_id: number | null;
  dob: string | null;
  email: string | null;
  first_name: string;
  id: number;
  last_name: string | null;
  mobile: string | null;
  subscribe_to_news_letter: boolean | null;
  cci?: ICCI | null;
  alternative_email?: string;
}
export interface ICCI {
  nbr: string | number;
  holder_name: string | number;
  expiry_month: string | number;
  expiry_year: string | number;
  cvc?: string | null;
}
export interface Occupancy {
  adult_nbr: number;
  children_nbr: number;
  infant_nbr: number | null;
}

export interface Origin {
  Icon: string;
  Label: string;
}

export interface Property {
  calendar_legends: null;
  currency: null;
  id: number;
  name: string;
  roomtypes: null;
}

export interface Room {
  days: Day[];
  from_date: string;
  guest: Guest;
  notes: string | null;
  occupancy: Occupancy;
  physicalroom: null;
  rateplan: RatePlan;
  roomtype: RoomType;
  to_date: string;
  total: number;
  identifier: string;
  unit: string | number | IUnit | null;
}
export interface IUnit {
  calendar_cell: null;
  id: 2;
  name: '402';
}
export interface Day {
  amount: number;
  date: string;
}

export interface RatePlan {
  cancelation: string | null;
  guarantee: null;
  id: number;
  name: string;
  rate_restrictions: null;
  variations: null;
  selected_variation: IVariations;
  is_non_refundable: boolean;
  custom_text: string | null;
  is_active: boolean;
}
export interface IVariations {
  adult_child_offering: string;
  adult_nbr: number;
  amount: number | null;
  child_nbr: number;
}
export interface RoomType {
  availabilities: null;
  id: number;
  inventory: number;
  name: string;
  physicalrooms: null;
  rate: number;
  rateplans: null;
  is_active: boolean;
}

export interface Source {
  code: string | null;
  description: string;
  tag: string | null;
}

export interface Status {
  code: string;
  description: string;
}
