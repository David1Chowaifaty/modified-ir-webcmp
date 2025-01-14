import { SharedPerson } from './../../models/booking.dto';
//Sidebar
export type BookingDetailsSidebarEvents = 'guest' | 'pickup' | 'extra_note' | 'extra_service' | 'room-guest';
export type OpenSidebarEvent<T> = {
  type: BookingDetailsSidebarEvents;
  payload?: T;
};
//Dialog
export type BookingDetailsDialogEvents = 'pms' | 'events-log';
export type OpenDialogEvent = {
  type: BookingDetailsDialogEvents;
  payload?: unknown;
};
export type RoomGuestsPayload = {
  roomName: string;
  sharing_persons: SharedPerson[];
  totalGuests: number;
};
