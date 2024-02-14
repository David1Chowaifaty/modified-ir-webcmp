import { RoomDetail, STATUS } from './IBooking';
import { TAdultChildConstraints } from './igl-book-property';

export interface CalendarDataDetails {
  adultChildConstraints: TAdultChildConstraints;
  allowedBookingSources: IAllowedBookingSources[];
  currency: IPickupCurrency;
  endingDate: number;
  formattedLegendData: IFormattedLegendData;
  is_vacation_rental: boolean;
  legendData: ILegendData[];
  roomsInfo: RoomDetail[];
  startingDate: number;
  language: string;
  toBeAssignedEvents: [];
  max_nights: number;
  allowed_payment_methods: IAllowedPaymentMethods[];
  pickup_service: IPickupService;
  channels: IChannel[];
}

export interface IChannel {
  id: number;
  is_active: boolean;
  map: IMap[];
  name: string;
  property: IChannelProperty;
  title: string;
}
export interface IChannelProperty {
  id: string;
  name: string;
  room_types: IChannelRoomTypes[];
}
export interface IChannelRoomTypes {
  id: string;
  name: string;
  rate_plans: IChannelRatePlans[];
}
export interface IChannelRatePlans {
  id: string;
  name: string;
}
export interface IMap {
  foreign_description: string;
  foreign_id: string;
  ir_description: string;
  ir_id: string;
  type: 'string';
}
export interface IPickupCurrency extends ICurrency {
  symbol: string;
}
export interface IPickupService {
  allowed_locations: IAllowedLocation[];
  allowed_options: IAllowedOptions[];
  allowed_pricing_models: IPriceModel[];
  allowed_vehicle_types: IVehicle[];
  is_enabled: boolean;
  is_not_allowed_on_same_day: boolean;
  pickup_cancelation_prepayment: IPickupCancelationPrepayment;
  pickup_instruction: IPickupInstruction;
}
export interface IPickupInstruction {
  code: string;
  description: string;
}
export interface IPickupCancelationPrepayment {
  code: string;
  description: string;
}
export interface IAllowedOptions {
  amount: number;
  currency: IPickupCurrency;
  id: number;
  location: IAllowedLocation;
  vehicle: IVehicle;
  pricing_model: {
    code: string;
    description: string;
  };
}
export interface IVehicle {
  code: string;
  description: string;
  capacity: number;
}

export interface IPriceModel {
  code: string;
  description: string;
}
export interface IAllowedLocation {
  description: string;
  id: number;
}
export interface IAllowedPaymentMethods {
  code: string;
  description: string;
  icon_class_name: string | null;
  img_url: string | null;
  notes: string | null;
}

export interface IAllowedBookingSources {
  code: string;
  description: string;
  id: string;
  tag: string;
  type: string;
}
export interface ICurrency {
  code: string;
  id: number;
}
export interface IFormattedLegendData {
  legendData: ILegendData[];
  statusId: Record<STATUS, IStatusName>;
}
export interface ILegendData {
  color: string;
  design: string;
  id: string;
  name: string;
}
export interface IStatusName {
  id: number;
  clsName: string;
}

export interface CalendarMonth {
  daysCount: number;
  monthName: string;
}
