import axios from 'axios';
import moment from 'moment';
import { z, ZodTypeAny } from 'zod';

import { IBookingPickupInfo } from '@/components';
import calendar_data from '@/stores/calendar-data';
import { renderTime } from '@/utils/utils';

import { TDueParams, TPickupData } from './types';

export class PickupService {
  public async savePickup(params: TPickupData, booking_nbr: string, is_remove: boolean) {
    try {
      if (!params.currency || !params.selected_option) {
        throw new Error('Cannot save pickup without a selected option and currency.');
      }

      const [_, hours, minutes] = params.arrival_time
        ? params.arrival_time
            ?.toString()
            ?.match(/(\d{2})(\d{2})/)!
            ?.map(Number)
        : [null, null, null];
      await axios.post(`/Do_Pickup`, {
        booking_nbr,
        is_remove,
        currency: params.currency,
        date: params.arrival_date,
        details: params.flight_details,
        hour: hours ?? null,
        minute: minutes ?? null,
        nbr_of_units: params.number_of_vehicles,
        selected_option: params.selected_option,
        total: +params.due_upon_booking,
      });
    } catch (error) {
      console.log(error);
    }
  }

  public transformDefaultPickupData(data: IBookingPickupInfo): TPickupData {
    const arrival_time = data.hour && data.minute ? renderTime(data.hour) + ':' + renderTime(data.minute) : '';
    return {
      arrival_date: data.date,
      arrival_time,
      currency: data.currency,
      due_upon_booking: data.total.toFixed(2),
      flight_details: data.details,
      location: data.selected_option.location.id,
      number_of_vehicles: data.nbr_of_units,
      selected_option: data.selected_option,
      vehicle_type_code: data.selected_option.vehicle.code,
    };
  }
  public getAvailableLocations(message: string) {
    let locations: { value: number; text: string }[] = [];
    calendar_data.pickup_service.allowed_options.forEach(option => {
      if (locations.filter(location => location.value === option.location.id).length === 0) {
        locations.push({
          text: message + ' ' + option.location.description,
          value: option.location.id,
        });
      }
    });
    return locations;
  }
  public createPickupSchema(minDate: string, maxDate: string, options?: { allowRemoval?: boolean }) {
    const allowRemoval = Boolean(options?.allowRemoval);
    const asNumber = (value: unknown) => {
      if (typeof value === 'number') {
        return value;
      }
      if (typeof value === 'string' && value.trim() !== '') {
        const parsed = Number(value);
        return Number.isNaN(parsed) ? value : parsed;
      }
      return value;
    };

    const arrivalDateSchema = z
      .string()
      .min(1, { message: 'Arrival date is required.' })
      .regex(/^\d{4}-\d{2}-\d{2}$/, { message: 'Invalid date format, expected YYYY-MM-DD.' });

    return z.object({
      location: z.preprocess(asNumber, z.number().int()).refine(value => (allowRemoval ? value === -1 || value > 0 : value > 0), {
        message: 'Please select a pickup option.',
      }),
      arrival_date: z
        .preprocess(value => (typeof value === 'string' ? value : value ?? ''), arrivalDateSchema)
        .refine(
          dateStr => {
            const date = moment(dateStr, 'YYYY-MM-DD', true);
            const min = moment(minDate, 'YYYY-MM-DD', true);
            const max = moment(maxDate, 'YYYY-MM-DD', true);
            return date.isValid() && min.isValid() && max.isValid() && date.isBetween(min, max, undefined, '[]');
          },
          { message: `Arrival date must be between ${minDate} and ${maxDate}.` },
        ),
      arrival_time: z
        .preprocess(value => (typeof value === 'string' ? value : value ?? ''), z.string().regex(/^\d{2}\d{2}$/, { message: 'Invalid time format. Expected HH:MM.' }))
        .refine(
          time => {
            const strTime = time.toString();
            if (strTime.length < 4) {
              return false;
            }

            const [_, hours, minutes] = strTime.match(/(\d{2})(\d{2})/)!.map(Number);

            // const [hours, minutes] = time.split(':').map(Number);
            return hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59;
          },
          { message: 'Time values are out of range.' },
        ),
      flight_details: z.preprocess(value => (typeof value === 'string' ? value : ''), z.string().nonempty({ message: 'Flight details cannot be empty.' })),
      vehicle_type_code: z.preprocess(value => (typeof value === 'string' ? value : ''), z.string().nonempty({ message: 'Vehicle type code cannot be empty.' })),
      number_of_vehicles: z.preprocess(asNumber, z.number().int().min(1, { message: 'At least one vehicle is required.' })),
    });
  }
  public validateForm(params: TPickupData, schema: ZodTypeAny) {
    return schema.safeParse(params);
  }
  public getNumberOfVehicles(capacity: number, numberOfPersons: number) {
    let total_number_of_vehicles = Math.ceil(numberOfPersons / capacity);
    let startNumber = total_number_of_vehicles > 1 ? total_number_of_vehicles : 1;
    let bonus_number = total_number_of_vehicles > 1 ? 2 : 3;
    return Array.from({ length: total_number_of_vehicles + bonus_number }, (_, i) => startNumber + i);
  }
  private getPickUpPersonStatus(code: string) {
    const getCodeDescription = calendar_data.pickup_service.allowed_pricing_models.find(model => model.code === code);
    if (!getCodeDescription) {
      return null;
    }
    return getCodeDescription.description;
  }
  public updateDue(params: TDueParams) {
    const getCodeDescription = this.getPickUpPersonStatus(params.code);
    if (!getCodeDescription) {
      return;
    }
    if (getCodeDescription === 'Person') {
      return params.amount * params.numberOfPersons;
    } else {
      return params.amount * params.number_of_vehicles;
    }
  }
}
