export interface BookingDetails {
  roomtypes: RoomDetail[];
  tax_statement: string;
}

export interface RoomDetail {
  availabilities: number | null;
  id: number;
  inventory: number;
  name: string;
  rate: number;
  rateplans: RatePlanDetail[];
  physicalrooms: PhysicalRoomDetail[];
}

export interface RatePlanDetail {
  id: number;
  name: string;
  rate_restrictions: null;
  variations: RateVariation[];
}
export interface RateVariation {
  adult_child_offering: string;
  adult_nbr: number;
  amount: number;
  child_nbr: number;
}
export interface PhysicalRoomDetail {
  calendar_cell: null;
  id: number;
  name: string;
}
export interface RatePlanDetail {
  id: number;
  name: string;
  rate_restrictions: null;
  variations: RateVariation[];
  totalRooms: number;
  index: number;
  isFirst: boolean;
}

type ChangedProperty = string;
export interface RoomRatePlanUpdateData {
  changedProperty: ChangedProperty;
  newValue: any;
  ratePlanIndex: number;
  rate: number;
}
export interface RoomRatePlanUpdateEvent {
  eventType: "roomRatePlanUpdate";
  data: RoomRatePlanUpdateData;
}
export interface RoomUpdateEvent {
  roomRatePlanUpdateData: RoomRatePlanUpdateData;
  roomCategoryId: number;
  roomCategoryName: string;
}
