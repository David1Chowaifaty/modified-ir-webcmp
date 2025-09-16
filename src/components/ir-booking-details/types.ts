import { IEntries } from '@/models/IBooking';
import { RoomType, RatePlan } from '@/models/reservation.dto';
import { IPayment, SharedPerson } from './../../models/booking.dto';
import { ExposedApplicablePolicy } from '@/services/booking.service';
//Sidebar
export type BookingDetailsSidebarEvents = 'guest' | 'pickup' | 'extra_note' | 'extra_service' | 'room-guest' | 'payment-folio';
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
export type PaymentSidebarEvent = {
  type: 'payment-folio';
  payload: { payment: IPayment; mode: FolioEntryMode };
};
export type FolioEntryMode = 'edit' | 'new' | 'payment-action';
export type RoomGuestsPayload = {
  roomName: string;
  sharing_persons: SharedPerson[];
  totalGuests: number;
  checkin: boolean;
  identifier: string;
};
export type PaymentEntries = {
  types: IEntries[];
  groups: IEntries[];
  methods: IEntries[];
};
export type CancellationStatement = {
  roomType: RoomType;
  ratePlan: RatePlan;
} & ExposedApplicablePolicy;
