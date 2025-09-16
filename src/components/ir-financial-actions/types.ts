import { IPayment } from '@/models/booking.dto';

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
        payment: IPayment;
        bookingNumber: number;
      };
    };
export type DailyFinancialActionsFilter = {
  date: string;
  sourceCode: string;
};
