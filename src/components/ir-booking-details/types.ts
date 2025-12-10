import { IEntries } from '@/models/IBooking';
import { RoomType, RatePlan, ExposedApplicablePolicy } from '@/models/booking.dto';
import { IPayment, SharedPerson } from './../../models/booking.dto';
//Sidebar
export type BookingDetailsSidebarEvents = 'invoice' | 'guest' | 'pickup' | 'extra_note' | 'extra_service' | 'room-guest' | 'payment-folio';
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
  booking_nbr?: string | number;
};
export type PaymentEntries = {
  types: IEntries[];
  groups: IEntries[];
  methods: IEntries[];
};
export type CancellationStatement = {
  roomType: RoomType;
  ratePlan: RatePlan;
  checkInDate: string;
  grossTotal: number;
} & ExposedApplicablePolicy;

export type Payment = Omit<IPayment, 'time_stamp'>;

export type PrintScreenOptions =
  | {
      mode: 'printing' | 'invoice' | 'proforma' | 'creditnote';
    }
  | {
      mode: 'receipt';
      payload: {
        pid: string;
        rnb: string;
      };
    };
