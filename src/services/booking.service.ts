import { DayData } from '../models/DayType';
import axios from 'axios';
import { BookingDetails, IBlockUnit, ICountry, IEntries, ISetupEntries, MonthType } from '../models/IBooking';

import { convertDateToCustomFormat, convertDateToTime, dateToFormattedString } from '../utils/utils';
import { getMyBookings } from '../utils/booking';
import { Booking, Day } from '../models/booking.dto';

export class BookingService {
  public async getCalendarData(propertyid: number, from_date: string, to_date: string): Promise<{ [key: string]: any }> {
    try {
      const token = JSON.parse(sessionStorage.getItem('token'));
      if (token !== null) {
        const { data } = await axios.post(`/Get_Exposed_Calendar?Ticket=${token}`, {
          propertyid,
          from_date,
          to_date,
        });
        if (data.ExceptionMsg !== '') {
          throw new Error(data.ExceptionMsg);
        }
        const months: MonthType[] = data.My_Result.months;
        const customMonths: { daysCount: number; monthName: string }[] = [];
        const myBooking = await getMyBookings(months);
        const days: DayData[] = months
          .map(month => {
            customMonths.push({
              daysCount: month.days.length,
              monthName: month.description,
            });
            return month.days.map(day => ({
              day: convertDateToCustomFormat(day.description, month.description),
              currentDate: convertDateToTime(day.description, month.description),
              dayDisplayName: day.description,
              rate: day.room_types,
              unassigned_units_nbr: day.unassigned_units_nbr,
              occupancy: day.occupancy,
            }));
          })
          .flat();

        return Promise.resolve({
          ExceptionCode: null,
          ExceptionMsg: '',
          My_Params_Get_Rooming_Data: {
            AC_ID: propertyid,
            FROM: data.My_Params_Get_Exposed_Calendar.from_date,
            TO: data.My_Params_Get_Exposed_Calendar.to_date,
          },
          days,
          months: customMonths,
          myBookings: myBooking,
          defaultMonths: months,
        });
      }
    } catch (error) {
      console.error(error);
    }
  }
  public async getBookingAvailability(
    from_date: string,
    to_date: string,
    propertyid: number,
    language: string,
    room_type_ids: number[],
    currency: { id: number; code: string },
  ): Promise<BookingDetails> {
    try {
      const token = JSON.parse(sessionStorage.getItem('token'));
      if (token) {
        const { data } = await axios.post(`/Get_Exposed_Booking_Availability?Ticket=${token}`, {
          propertyid,
          from_date,
          to_date,
          adult_nbr: 2,
          child_nbr: 0,
          language,
          currency_ref: currency.code,
          room_type_ids,
        });
        if (data.ExceptionMsg !== '') {
          throw new Error(data.ExceptionMsg);
        }
        return data['My_Result'];
      } else {
        throw new Error("Token doesn't exist");
      }
    } catch (error) {
      console.error(error);
      throw new Error(error);
    }
  }

  public async getCountries(language: string): Promise<ICountry[]> {
    try {
      const token = JSON.parse(sessionStorage.getItem('token'));
      if (token) {
        const { data } = await axios.post(`/Get_Exposed_Countries?Ticket=${token}`, {
          language,
        });
        if (data.ExceptionMsg !== '') {
          throw new Error(data.ExceptionMsg);
        }
        return data.My_Result;
      }
    } catch (error) {
      console.error(error);
      throw new Error(error);
    }
  }

  public async fetchSetupEntries(): Promise<ISetupEntries> {
    try {
      const token = JSON.parse(sessionStorage.getItem('token'));
      if (token) {
        const { data } = await axios.post(`/Get_Setup_Entries_By_TBL_NAME_MULTI?Ticket=${token}`, {
          TBL_NAMES: ['_ARRIVAL_TIME',  '_RATE_PRICING_MODE', '_BED_PREFERENCE_TYPE'],
        });
        if (data.ExceptionMsg !== '') {
          throw new Error(data.ExceptionMsg);
        }
        const res: any[] = data.My_Result;
        return {
          arrivalTime: res.filter(e => e.TBL_NAME === '_ARRIVAL_TIME'),
          
          ratePricingMode: res.filter(e => e.TBL_NAME === '_RATE_PRICING_MODE'),
          bedPreferenceType: res.filter(e => e.TBL_NAME === '_BED_PREFERENCE_TYPE'),
        };
      }
    } catch (error) {
      console.error(error);
      throw new Error(error);
    }
  }
  public async getBlockedInfo(): Promise<IEntries[]> {
    try {
      const token = JSON.parse(sessionStorage.getItem('token'));
      if (token) {
        const { data } = await axios.post(`/Get_Setup_Entries_By_TBL_NAME_MULTI?Ticket=${token}`, { TBL_NAMES: ['_CALENDAR_BLOCKED_TILL'] });
        if (data.ExceptionMsg !== '') {
          throw new Error(data.ExceptionMsg);
        }
        return data.My_Result;
      }
    } catch (error) {
      console.error(error);
      throw new Error(error);
    }
  }
  public async getUserDefaultCountry() {
    try {
      const token = JSON.parse(sessionStorage.getItem('token'));
      if (token) {
        const { data } = await axios.post(`/Get_Country_By_IP?Ticket=${token}`, {
          IP: '',
        });
        if (data.ExceptionMsg !== '') {
          throw new Error(data.ExceptionMsg);
        }
        return data['My_Result'];
      }
    } catch (error) {
      console.error(error);
      throw new Error(error);
    }
  }
  public async blockUnit(params: IBlockUnit) {
    try {
      const token = JSON.parse(sessionStorage.getItem('token'));
      if (token) {
        const { data } = await axios.post(`/Block_Exposed_Unit?Ticket=${token}`, params);
        if (data.ExceptionMsg !== '') {
          throw new Error(data.ExceptionMsg);
        }
        console.log(data);
        return data['My_Params_Block_Exposed_Unit'];
      }
    } catch (error) {
      console.error(error);
      throw new Error(error);
    }
  }

  public async getUserInfo(email: string) {
    try {
      const token = JSON.parse(sessionStorage.getItem('token'));
      if (token) {
        const { data } = await axios.post(`/GET_EXPOSED_GUEST?Ticket=${token}`, {
          email,
        });
        if (data.ExceptionMsg !== '') {
          throw new Error(data.ExceptionMsg);
        }
        return data.My_Result;
      } else {
        throw new Error('Invalid Token');
      }
    } catch (error) {
      console.error(error);
      throw new Error(error);
    }
  }
  public async getExoposedBooking(booking_nbr: string, language: string): Promise<Booking> {
    try {
      const token = JSON.parse(sessionStorage.getItem('token'));
      if (token) {
        const { data } = await axios.post(`/Get_Exposed_Booking?Ticket=${token}`, {
          booking_nbr,
          language,
        });
        if (data.ExceptionMsg !== '') {
          throw new Error(data.ExceptionMsg);
        }
        return data.My_Result;
      } else {
        throw new Error('Invalid Token');
      }
    } catch (error) {
      console.error(error);
    }
  }
  private generateDays(from_date: string, to_date: string, amount: number): Day[] {
    const startDate = new Date(from_date);
    const endDate = new Date(to_date);
    const days: Day[] = [];

    while (startDate < endDate) {
      days.push({
        date: startDate.toISOString().split('T')[0],
        amount: amount,
      });
      startDate.setDate(startDate.getDate() + 1);
    }

    return days;
  }
  private calculateTotalRate(rate: number, totalNights: number, isRateModified: boolean, preference: number) {
    if (isRateModified && preference === 2) {
      return +rate;
    }
    return +rate / +totalNights;
  }
  public async bookUser(
    bookedByInfoData,
    check_in: boolean,
    fromDate: Date,
    toDate: Date,
    guestData,
    totalNights: number,
    source: { code: string; description: string },
    propertyid: number,
    currency: { id: number; code: string },
    bookingNumber?: string,
    defaultGuest?: any,
    arrivalTime?: any,
    pr_id?: number,
  ) {
    try {
      const token = JSON.parse(sessionStorage.getItem('token'));
      if (token) {
        const fromDateStr = dateToFormattedString(fromDate);
        const toDateStr = dateToFormattedString(toDate);
        let guest: any = {
          email: bookedByInfoData.email || null,
          first_name: bookedByInfoData.firstName,
          last_name: bookedByInfoData.lastName,
          country_id: bookedByInfoData.countryId,
          city: null,
          mobile: bookedByInfoData.contactNumber,
          address: '',
          dob: null,
          subscribe_to_news_letter: bookedByInfoData.emailGuest || false,
          cci: bookedByInfoData.cardNumber
            ? {
                nbr: bookedByInfoData.cardNumber,
                holder_name: bookedByInfoData.cardHolderName,
                expiry_month: bookedByInfoData.expiryMonth,
                expiry_year: bookedByInfoData.expiryYear,
              }
            : null,
        };
        if (bookedByInfoData.id) {
          guest = { ...guest, id: bookedByInfoData.id };
        }
        const body = {
          assign_units: true,
          check_in,
          booking: {
            booking_nbr: bookingNumber || '',
            from_date: fromDateStr,
            to_date: toDateStr,
            remark: bookedByInfoData.message || null,
            property: {
              id: propertyid,
            },
            source,
            currency,
            arrival: {
              code: arrivalTime || bookedByInfoData.selectedArrivalTime,
            },
            guest: defaultGuest || guest,
            rooms: guestData.map(data => ({
              roomtype: {
                id: data.roomCategoryId,
                name: data.roomCategoryName,
                physicalrooms: null,
                rateplans: null,
                availabilities: null,
                inventory: data.inventory,
                rate: data.rate / totalNights,
              },
              rateplan: {
                id: data.ratePlanId,
                name: data.ratePlanName,
                rate_restrictions: null,
                variations: null,
                cancelation: data.cancelation,
                guarantee: data.guarantee,
              },
              unit: typeof pr_id === 'undefined' && data.roomId === '' ? null : { id: pr_id || data.roomId },
              occupancy: {
                adult_nbr: data.adultCount,
                children_nbr: data.childrenCount,
                infant_nbr: null,
              },
              from_date: fromDateStr,
              to_date: toDateStr,
              notes: null,
              days: this.generateDays(fromDateStr, toDateStr, this.calculateTotalRate(data.rate, totalNights, data.isRateModified, data.rateType)),
              guest: {
                email: null,
                first_name: data.guestName,
                last_name: null,
                country_id: null,
                city: null,
                mobile: null,
                address: null,
                dob: null,
                subscribe_to_news_letter: null,
              },
            })),
          },
        };
        console.log('body', body);
        const { data } = await axios.post(`/DoReservation?Ticket=${token}`, body);
        if (data.ExceptionMsg !== '') {
          throw new Error(data.ExceptionMsg);
        }
        console.log(data['My_Result']);
        return data['My_Result'];
      } else {
        throw new Error('Invalid token');
      }
    } catch (error) {
      console.error(error);
      throw new Error(error);
    }
  }
}
