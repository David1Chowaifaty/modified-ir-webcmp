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
