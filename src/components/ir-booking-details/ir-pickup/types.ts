import { AllowedOption } from '@/models/property-types';

export type TPickupData = {
  location: number;
  flight_details: string;
  due_upon_booking: string;
  number_of_vehicles: number;
  vehicle_type_code: string;
  currency: AllowedOption['currency'];
  arrival_time: string;
  arrival_date: string;
  selected_option: AllowedOption;
};

export type TDueParams = {
  code: string;
  amount: number;
  numberOfPersons: number;
  number_of_vehicles: number;
};
