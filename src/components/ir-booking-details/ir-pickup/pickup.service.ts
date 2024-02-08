import axios from 'axios';
import { TDueParams, TPickupData } from './types';
import calendar_data from '@/stores/calendar-data';

export class PickupService {
  token: string | null;
  constructor() {
    this.token = JSON.parse(sessionStorage.getItem('token'));
  }
  public async savePickup(params: TPickupData, booking_nbr: string) {
    try {
      const splitTime = params.arrival_time.split(':');
      await axios.post(`/Do_Pickup?Ticket=${this.token}`, {
        booking_nbr,
        is_remove: false,
        currency: params.currency,
        date: params.arrival_date,
        details: params.flight_details,
        hour: splitTime[0],
        minute: splitTime[1],
        nbr_of_units: params.number_of_vehicles,
        selected_option: params.selected_option,
        total: params.due_upon_booking,
      });
    } catch (error) {
      console.log(error);
    }
  }
  public validateForm(params: TPickupData): { error: boolean; cause?: keyof TPickupData } {
    if (params.arrival_time.split(':').length !== 2) {
      return {
        error: true,
        cause: 'arrival_time',
      };
    }
    if (params.flight_details === '') {
      return {
        error: true,
        cause: 'flight_details',
      };
    }
    if (params.vehicle_type_code === '') {
      return {
        error: true,
        cause: 'vehicle_type_code',
      };
    }
    if (params.number_of_vehicles === 0) {
      return {
        error: true,
        cause: 'number_of_vehicles',
      };
    }
    return { error: false };
  }
  // private getPickUpPersonStatus(code: string) {
  //   const getCodeDescription = calendar_data.pickup_service.allowed_pricing_models.find(model => model.code === code);
  //   if (!getCodeDescription) {
  //     return null;
  //   }
  //   return getCodeDescription.description;
  // }
  public updateDue(params: TDueParams) {
    const getCodeDescription = calendar_data.pickup_service.allowed_pricing_models.find(model => model.code === params.code);
    if (!getCodeDescription) {
      return;
    }
    if (getCodeDescription.description === 'Person') {
      return params.amount * params.numberOfPersons;
    } else {
      return params.amount * params.number_of_vehicles;
    }
  }
  public getNumberOfVehicles() {}
}
