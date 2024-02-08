import { IAllowedOptions, IPickupCurrency } from '@/models/calendarData';

export type TPickupData = {
  location: string;
  flight_details: string;
  due_upon_booking: string;
  number_of_vehicles: number;
  vehicle_type_code: string;
  currency: IPickupCurrency;
  arrival_time: string;
  arrival_date: string;
  selected_option: IAllowedOptions;
};

export type TDueParams = {
  code: string;
  amount: number;
  numberOfPersons: number;
  number_of_vehicles: number;
};
