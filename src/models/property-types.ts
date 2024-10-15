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

export interface Currency {
  code: string;
  id: number;
}

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
  bookingNumber: string;
  identifier: string;
  to_date: string;
  pool: string;
  from_date: string;
  defaultDates: { from_date: string; to_date: string };
}
