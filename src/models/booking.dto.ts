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
  unit: string | number | null;
}

export interface Day {
  amount: number;
  date: string;
}

export interface RatePlan {
  cancelation: null;
  guarantee: null;
  id: number;
  name: string;
  rate_restrictions: null;
  variations: null;
}

export interface RoomType {
  availabilities: null;
  id: number;
  inventory: number;
  name: string;
  physicalrooms: null;
  rate: number;
  rateplans: null;
}

export interface Source {
  code: string | null;
  description: string;
}

export interface Status {
  code: string;
  description: string;
}
