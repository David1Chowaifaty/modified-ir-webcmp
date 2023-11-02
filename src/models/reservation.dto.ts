export interface Booking {
  booking_nbr: string;
  from_date: string;
  to_date: string;
  total: number;
  remark: string;
  property: Property;
  source: Source;
  occupancy: Occupancy;
  currency: Currency;
  status: Status;
  booked_on: BookedOn;
  arrival: Arrival;
  customer: Customer;
  rooms: Room[];
}

export interface Property {
  id: number;
  name: string;
  currency: null;
  roomtypes: null;
  calendar_legends: null;
}

export interface Source {
  Label: string;
  Icon: string;
}

export interface Occupancy {
  adult_nbr: number;
  children_nbr: number;
  infant_nbr: null;
}

export interface Currency {
  id: number;
  code: string;
}

export interface Status {
  code: string;
  description: string;
}

export interface BookedOn {
  date: string;
  hour: number;
  minute: number;
}

export interface Arrival {
  code: string;
  description: string;
}

export interface Customer {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  country_id: number;
  city: null;
  mobile: string;
  address: string;
  dob: null;
}

export interface Room {
  roomtype: RoomType;
  rateplan: RatePlan;
  physicalroom: null;
  occupancy: Occupancy;
  from_date: string;
  to_date: string;
  notes: null;
  days: Day[];
  guest: Guest;
  total: number;
}

export interface RoomType {
  id: number;
  name: string;
  physicalrooms: null;
  rateplans: null;
  availabilities: null;
  inventory: number;
  rate: number;
}

export interface RatePlan {
  id: number;
  name: string;
  rate_restrictions: null;
  variations: null;
  cancelation: null;
  guarantee: null;
}

export interface Day {
  date: string;
  amount: number;
}

export interface Guest {
  id: number;
  email: null;
  first_name: string;
  last_name: null;
  country_id: null;
  city: null;
  mobile: null;
  address: null;
  dob: null;
}
