import { Payment } from '../ir-booking-details/types';

export type SidebarOpenEvent =
  | {
      type: 'booking';
      payload: {
        bookingNumber: number;
      };
    }
  | {
      type: 'payment';
      payload: {
        payment: Payment;
        bookingNumber: number;
      };
    };
export type DailyFinancialActionsFilter = {
  date: string;
  sourceCode: string;
};
