export interface FolioPayment {
  method: string;
  payTypeCode: string;
  amount: number;
  date: string;
  hour: number;
  minute: number;
  user: string;
  currency: string;
  bookingNbr: string;
  id: string;
  payMethodCode: string;
}

export type GroupedFolioPayment = Map<FolioPayment['method'], FolioPayment[]>;
export type SidebarOpenEvent = {
  type: 'booking';
  payload: {
    bookingNumber: number;
  };
};
export type DailyPaymentFilter = {
  date: string;
  users: string | null;
};
