import { IEntries } from '@/models/IBooking';
import { RoomType, RatePlan, ExposedApplicablePolicy, Bracket } from '@/models/booking.dto';
import { IPayment, SharedPerson } from './../../models/booking.dto';
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
  payload: { payment: Payment; mode: FolioEntryMode };
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

export type BracketWithCheckIn = Bracket & { is_check_in_date?: boolean };

interface StatementApplicablePolicy extends ExposedApplicablePolicy {
  brackets: BracketWithCheckIn[];
}

export type CancellationStatement = {
  roomType: RoomType;
  ratePlan: RatePlan;
  checkInDate: string;
  grossTotal: number;
} & StatementApplicablePolicy;

export type Payment = Omit<IPayment, 'time_stamp'>;
