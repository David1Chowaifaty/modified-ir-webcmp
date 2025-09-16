import { ExposedBookingEvent, HandleExposedRoomGuestsRequest } from './../models/booking.dto';
import { DayData } from '../models/DayType';
import axios from 'axios';
import { BookingDetails, IBlockUnit, ICountry, IEntries, ISetupEntries, MonthType, ZIEntrySchema } from '../models/IBooking';
import { convertDateToCustomFormat, convertDateToTime, dateToFormattedString, extras } from '../utils/utils';
import { getMyBookings } from '../utils/booking';
import { Booking, Day, ExtraService, Guest, IBookingPickupInfo, IPmsLog, RoomInOut } from '../models/booking.dto';
import booking_store from '@/stores/booking.store';
import calendar_data from '@/stores/calendar-data';
import { PaymentEntries } from '@/components/ir-booking-details/types';
import { z } from 'zod';

export interface IBookingParams {
  bookedByInfoData: any;
  check_in: boolean;
  fromDate: Date;
  toDate: Date;
  guestData;
  totalNights: number;
  source: { code: string; description: string };
  propertyid: number;
  rooms: any[];
  currency: { id: number; code: string };
  pickup_info: IBookingPickupInfo | null;
  bookingNumber?: string;
  defaultGuest?: any;
  arrivalTime?: any;
  pr_id?: number;
  identifier?: string;
  extras: { key: string; value: string }[] | null;
}
export interface ExposedApplicablePolicy {
  brackets: Bracket[];
  combined_statement: string;
  type: 'cancelation' | 'guarantee';
}

export interface Bracket {
  amount: number;
  amount_formatted: string;
  code: string;
  currency_id: number;
  due_on: string;
  due_on_formatted: null | string;
  gross_amount: number;
  gross_amount_formatted: string;
  statement: string;
}

export type TableEntries =
  | '_CALENDAR_BLOCKED_TILL'
  | '_DEPARTURE_TIME'
  | '_ARRIVAL_TIME'
  | '_RATE_PRICING_MODE'
  | '_BED_PREFERENCE_TYPE'
  | '_PAY_TYPE'
  | '_PAY_TYPE_GROUP'
  | '_PAY_METHOD'
  | (string & {});

export type GroupedTableEntries = {
  [K in TableEntries as K extends `_${infer Rest}` ? Lowercase<Rest> : never]: IEntries[];
};

/**
 * Builds a grouped payment types record from raw entries and groups.
 *
 * @param paymentEntries - The flat list of all available payment  entries.
 * @returns A record where each key is a group CODE_NAME and the value is the
 *          ordered array of payment type entries belonging to that group.
 *
 * @example
 * const result = buildPaymentTypes(paymentEntries);
 * // {
 * //   PAYMENTS: [ { CODE_NAME: "001", CODE_VALUE_EN: "Cash", ... }, ... ],
 * //   ADJUSTMENTS: [ ... ],
 * //   ...
 * // }
 */
export function buildPaymentTypes(paymentEntries: PaymentEntries): Record<string, IEntries[]> {
  try {
    const { groups, types } = z
      .object({
        types: ZIEntrySchema.array().min(1),
        groups: ZIEntrySchema.array().min(1),
        methods: ZIEntrySchema.array().min(1),
      })
      .parse(paymentEntries);
    const items = [...types];

    const byCodes = (codes: string[]) => codes.map(code => items.find(i => i.CODE_NAME === code)).filter((x): x is IEntries => Boolean(x));

    const extractGroupCodes = (code: string) => {
      const paymentGroup = groups.find(pt => pt.CODE_NAME === code);
      return paymentGroup ? paymentGroup.CODE_VALUE_EN.split(',') : [];
    };
    let rec: Record<string, IEntries[]> = {};
    groups.forEach(group => {
      // if (group.CODE_NAME === 'PAYMENTS') {
      //   rec[group.CODE_NAME] = methods.map(entry => ({
      //     ...entry,
      //     CODE_VALUE_EN: `Payment: ${entry.CODE_VALUE_EN}`,
      //   })) as IEntries[];
      // } else if (group.CODE_NAME === 'REFUND') {
      //   rec[group.CODE_NAME] = methods.map(entry => ({
      //     ...entry,
      //     CODE_VALUE_EN: `Refund: ${entry.CODE_VALUE_EN}`,
      //   })) as IEntries[];
      rec[group.CODE_NAME] = byCodes(extractGroupCodes(group.CODE_NAME));
    });
    return rec;
  } catch (error) {
    console.log(error);
    return {};
  }
}
export class BookingService {
  public async unBlockUnitByPeriod(props: { unit_id: number; from_date: string; to_date: string }) {
    const { data } = await axios.post(`/Unblock_Unit_By_Period`, props);
    if (data.ExceptionMsg !== '') {
      throw new Error(data.ExceptionMsg);
    }
    return data;
  }
  public async getExposedApplicablePolicies(props: {
    booking_nbr: string;
    currency_id: number;
    language?: string;
    rate_plan_id: number;
    room_type_id: number;
    property_id: number;
  }): Promise<ExposedApplicablePolicy[] | null> {
    const { data } = await axios.post(`/Get_Exposed_Applicable_Policies`, props);
    if (data.ExceptionMsg !== '') {
      throw new Error(data.ExceptionMsg);
    }
    return data.My_Result ?? [];
  }

  public async handleExposedRoomInOut(props: { booking_nbr: string; room_identifier: string; status: RoomInOut['code'] }) {
    const { data } = await axios.post(`/Handle_Exposed_Room_InOut`, props);
    if (data.ExceptionMsg !== '') {
      throw new Error(data.ExceptionMsg);
    }
    return data;
  }
  public async GetPenaltyStatement(params: { booking_nbr: string; currency_id: number; language: string }) {
    const { data } = await axios.post('/Get_Penalty_Statement', params);
    if (data.ExceptionMsg !== '') {
      throw new Error(data.ExceptionMsg);
    }
    return data.My_Result;
  }
  public async setExposedRestrictionPerRoomType(params: { is_closed: boolean; restrictions: { room_type_id: number | string; night: string }[]; operation_type?: string }) {
    const { data } = await axios.post(`https://gateway.igloorooms.com/IRBE/Set_Exposed_Restriction_Per_Room_Type`, {
      operation_type: params.operation_type ?? 'close_open',
      ...params,
    });
    if (data.ExceptionMsg !== '') {
      throw new Error(data.ExceptionMsg);
    }
    return data;
  }
  public async getLov() {
    const { data } = await axios.post(`/Get_LOV`, {});
    if (data.ExceptionMsg !== '') {
      throw new Error(data.ExceptionMsg);
    }
    return data;
  }
  public async sendBookingConfirmationEmail(booking_nbr: string, language: string) {
    const { data } = await axios.post(`/Send_Booking_Confirmation_Email`, {
      booking_nbr,
      language,
    });
    if (data.ExceptionMsg !== '') {
      throw new Error(data.ExceptionMsg);
    }
    return data.My_Result;
  }

  public async getCalendarData(propertyid: number, from_date: string, to_date: string): Promise<{ [key: string]: any }> {
    try {
      const { data } = await axios.post(`/Get_Exposed_Calendar`, {
        propertyid,
        from_date,
        to_date,
        extras,
        include_sales_rate_plans: true,
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
          return month.days.map(day => {
            if (day['value'] === '2025-05-30') {
              console.log(day);
            }
            return {
              day: convertDateToCustomFormat(day.description, month.description),
              value: day.value,
              currentDate: convertDateToTime(day.description, month.description),
              dayDisplayName: day.description,
              rate: day.room_types,
              unassigned_units_nbr: day.unassigned_units_nbr,
              occupancy: day.occupancy,
            };
          });
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
    } catch (error) {
      console.error(error);
    }
  }
  public async handleExposedRoomGuests(props: HandleExposedRoomGuestsRequest) {
    const { data } = await axios.post('/Handle_Exposed_Room_Guests', props);
    if (data.ExceptionMsg !== '') {
      throw new Error(data.ExceptionMsg);
    }
    return data;
  }
  public async fetchGuest(email: string): Promise<Guest> {
    try {
      const { data } = await axios.post(`/Get_Exposed_Guest`, { email });
      if (data.ExceptionMsg !== '') {
        throw new Error(data.ExceptionMsg);
      }
      return data.My_Result;
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  }
  public async changeExposedBookingStatus(props: { book_nbr: string; status: string }) {
    try {
      const { data } = await axios.post(`/Change_Exposed_Booking_Status`, props);
      if (data.ExceptionMsg !== '') {
        throw new Error(data.ExceptionMsg);
      }
      return data.My_Result;
    } catch (error) {
      throw new Error(error);
    }
  }
  public async fetchPMSLogs(booking_nbr: string | number): Promise<IPmsLog> {
    try {
      const { data } = await axios.post(`/Get_Exposed_PMS_Logs`, { booking_nbr });
      if (data.ExceptionMsg !== '') {
        throw new Error(data.ExceptionMsg);
      }
      return data.My_Result;
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  }
  public async getExposedBookingEvents(booking_nbr: string | number): Promise<ExposedBookingEvent[] | null> {
    try {
      const { data } = await axios.post(`/Get_Exposed_Booking_Events`, { booking_nbr });
      if (data.ExceptionMsg !== '') {
        throw new Error(data.ExceptionMsg);
      }
      return data.My_Result;
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  }
  public async editExposedGuest(guest: Guest, book_nbr: string): Promise<any> {
    try {
      const { data } = await axios.post(`/Edit_Exposed_Guest`, { ...guest, book_nbr });
      if (data.ExceptionMsg !== '') {
        throw new Error(data.ExceptionMsg);
      }
      return data.My_Result;
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  }
  public async getBookingAvailability(props: {
    from_date: string;
    to_date: string;
    propertyid: number;
    adultChildCount: { adult: number; child: number };
    language: string;
    room_type_ids: number[];
    room_type_ids_to_update?: number[];
    rate_plan_ids?: number[];
    currency: { id: number; code: string };
    is_in_agent_mode?: boolean;
    agent_id?: string | number;
  }): Promise<BookingDetails> {
    try {
      const { adultChildCount, currency, ...rest } = props;
      const { data } = await axios.post(`/Check_Availability`, {
        ...rest,
        adult_nbr: adultChildCount.adult,
        child_nbr: adultChildCount.child,
        currency_ref: currency.code,
        skip_getting_assignable_units: !calendar_data.is_frontdesk_enabled,
        is_backend: true,
      });
      if (data.ExceptionMsg !== '') {
        throw new Error(data.ExceptionMsg);
      }
      const results = this.modifyRateplans(this.sortRoomTypes(data['My_Result'], { adult_nbr: Number(adultChildCount.adult), child_nbr: Number(adultChildCount.child) }));
      booking_store.roomTypes = [...results];
      booking_store.tax_statement = { message: data.My_Result.tax_statement };
      return results;
    } catch (error) {
      console.error(error);
      throw new Error(error);
    }
  }
  private sortRoomTypes(roomTypes, userCriteria: { adult_nbr: number; child_nbr: number }) {
    return roomTypes.sort((a, b) => {
      // Priority to available rooms
      if (a.is_available_to_book && !b.is_available_to_book) return -1;
      if (!a.is_available_to_book && b.is_available_to_book) return 1;

      // Check for variations where is_calculated is true and amount is 0 or null
      const zeroCalculatedA = a.rateplans?.some(plan => plan.variations?.some(variation => variation.discounted_amount === 0 || variation.discounted_amount === null));
      const zeroCalculatedB = b.rateplans?.some(plan => plan.variations?.some(variation => variation.discounted_amount === 0 || variation.discounted_amount === null));

      // Prioritize these types to be before inventory 0 but after all available ones
      if (zeroCalculatedA && !zeroCalculatedB) return 1;
      if (!zeroCalculatedA && zeroCalculatedB) return -1;

      // Check for exact matching variations based on user criteria
      const matchA = a.rateplans?.some(plan =>
        plan.variations?.some(variation => variation.adult_nbr === userCriteria.adult_nbr && variation.child_nbr === userCriteria.child_nbr),
      );
      const matchB = b.rateplans?.some(plan =>
        plan.variations?.some(variation => variation.adult_nbr === userCriteria.adult_nbr && variation.child_nbr === userCriteria.child_nbr),
      );

      if (matchA && !matchB) return -1;
      if (!matchA && matchB) return 1;

      // Sort by the highest variation amount
      const maxVariationA = Math.max(...a.rateplans.flatMap(plan => plan.variations?.map(variation => variation.discounted_amount ?? 0)));
      const maxVariationB = Math.max(...b.rateplans.flatMap(plan => plan.variations?.map(variation => variation.discounted_amount ?? 0)));

      if (maxVariationA < maxVariationB) return -1;
      if (maxVariationA > maxVariationB) return 1;

      return 0;
    });
  }
  private modifyRateplans(roomTypes) {
    return roomTypes?.map(rt => ({ ...rt, rateplans: rt.rateplans?.map(rp => ({ ...rp, variations: this.sortVariations(rp?.variations ?? []) })) }));
  }
  private sortVariations(variations) {
    return variations.sort((a, b) => {
      if (a.adult_nbr !== b.adult_nbr) {
        return b.adult_nbr - a.adult_nbr;
      }
      return b.child_nbr - a.child_nbr;
    });
  }
  public async getCountries(language: string): Promise<ICountry[]> {
    try {
      const { data } = await axios.post(`/Get_Exposed_Countries`, {
        language,
      });
      if (data.ExceptionMsg !== '') {
        throw new Error(data.ExceptionMsg);
      }
      return data.My_Result;
    } catch (error) {
      console.error(error);
      throw new Error(error);
    }
  }
  public async getSetupEntriesByTableName(TBL_NAME: string): Promise<IEntries[]> {
    const { data } = await axios.post(`/Get_Setup_Entries_By_TBL_NAME`, {
      TBL_NAME,
    });
    if (data.ExceptionMsg !== '') {
      throw new Error(data.ExceptionMsg);
    }
    const res: IEntries[] = data.My_Result ?? [];
    return res;
  }

  public async fetchSetupEntries(): Promise<ISetupEntries> {
    try {
      const data = await this.getSetupEntriesByTableNameMulti(['_ARRIVAL_TIME', '_RATE_PRICING_MODE', '_BED_PREFERENCE_TYPE']);
      const { arrival_time, rate_pricing_mode, bed_preference_type } = this.groupEntryTablesResult(data);
      return {
        arrivalTime: arrival_time,
        ratePricingMode: rate_pricing_mode,
        bedPreferenceType: bed_preference_type,
      };
    } catch (error) {
      console.error(error);
      throw new Error(error);
    }
  }
  public async doBookingExtraService({ booking_nbr, service, is_remove }: { service: ExtraService; booking_nbr: number | string; is_remove: boolean }) {
    const { data } = await axios.post(`/Do_Booking_Extra_Service`, { ...service, booking_nbr, is_remove });
    if (data.ExceptionMsg !== '') {
      throw new Error(data.ExceptionMsg);
    }
    return data.My_Result;
  }

  public groupEntryTablesResult(entries: IEntries[]): GroupedTableEntries {
    let result = {};
    for (const entry of entries) {
      const key = entry.TBL_NAME.substring(1, entry.TBL_NAME.length).toLowerCase();
      if (!result[key]) {
        result[key] = [];
      }
      result[key] = [...result[key], entry];
    }
    return result as GroupedTableEntries;
  }
  public async getSetupEntriesByTableNameMulti(entries: TableEntries[]): Promise<IEntries[]> {
    const { data } = await axios.post(`/Get_Setup_Entries_By_TBL_NAME_MULTI`, { TBL_NAMES: entries });
    if (data.ExceptionMsg !== '') {
      throw new Error(data.ExceptionMsg);
    }
    return data.My_Result;
  }
  public async getBlockedInfo(): Promise<IEntries[]> {
    return await this.getSetupEntriesByTableNameMulti(['_CALENDAR_BLOCKED_TILL']);
  }
  public async getUserDefaultCountry() {
    try {
      const { data } = await axios.post(`/Get_Country_By_IP`, {
        IP: '',
      });
      if (data.ExceptionMsg !== '') {
        throw new Error(data.ExceptionMsg);
      }
      return data['My_Result'];
    } catch (error) {
      console.error(error);
      throw new Error(error);
    }
  }

  public async blockUnit(params: IBlockUnit) {
    try {
      const { data } = await axios.post(`/Block_Exposed_Unit`, params);
      if (data.ExceptionMsg !== '') {
        throw new Error(data.ExceptionMsg);
      }
      console.log(data);
      return data['My_Params_Block_Exposed_Unit'];
    } catch (error) {
      console.error(error);
      throw new Error(error);
    }
  }
  public async blockAvailabilityForBrackets(params: {
    unit_id: number;
    block_status_code?: '003' | '004' | '002';
    description?: string;
    brackets: { from_date: string; to_date: string }[];
  }) {
    try {
      const { data } = await axios.post(`/Block_Availability_For_Brackets`, params);
      if (data.ExceptionMsg !== '') {
        throw new Error(data.ExceptionMsg);
      }
      return data;
    } catch (error) {
      console.error(error);
      throw new Error(error);
    }
  }
  public async setDepartureTime(params: { property_id: number; room_identifier: string; code: string }) {
    const { data } = await axios.post('/Set_Departure_Time', params);
    if (data.ExceptionMsg !== '') {
      throw new Error(data.ExceptionMsg);
    }
    return data;
  }

  public async getUserInfo(email: string) {
    try {
      const { data } = await axios.post(`/GET_EXPOSED_GUEST`, {
        email,
      });
      if (data.ExceptionMsg !== '') {
        throw new Error(data.ExceptionMsg);
      }
      return data.My_Result;
    } catch (error) {
      console.error(error);
      throw new Error(error);
    }
  }
  public async getExposedBooking(booking_nbr: string, language: string, withExtras: boolean = true): Promise<Booking> {
    try {
      const { data } = await axios.post(`/Get_Exposed_Booking`, {
        booking_nbr,
        language,
        extras: withExtras ? extras : null,
      });
      if (data.ExceptionMsg !== '') {
        throw new Error(data.ExceptionMsg);
      }
      return data.My_Result;
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
        cost: null,
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
  public async fetchExposedGuest(email: string, property_id: number) {
    try {
      const { data } = await axios.post(`/Fetch_Exposed_Guests`, {
        email,
        property_id,
      });
      if (data.ExceptionMsg !== '') {
        throw new Error(data.ExceptionMsg);
      }
      return data['My_Result'];
    } catch (error) {
      console.error(error);
      throw new Error(error);
    }
  }
  public async fetchExposedBookings(booking_nbr: string, property_id: number, from_date: string, to_date: string) {
    try {
      const { data } = await axios.post(`/Fetch_Exposed_Bookings`, {
        booking_nbr,
        property_id,
        from_date,
        to_date,
      });
      if (data.ExceptionMsg !== '') {
        throw new Error(data.ExceptionMsg);
      }
      return data['My_Result'];
    } catch (error) {
      console.error(error);
      throw new Error(error);
    }
  }
  public async getPCICardInfoURL(BOOK_NBR: string) {
    try {
      const { data } = await axios.post(`/Get_PCI_Card_Info_URL`, {
        BOOK_NBR,
      });
      if (data.ExceptionMsg !== '') {
        throw new Error(data.ExceptionMsg);
      }
      return data['My_Result'];
    } catch (error) {
      console.error(error);
      throw new Error(error);
    }
  }
  public async doReservation(body: any) {
    const { data } = await axios.post(`/DoReservation`, { ...body, extras: body.extras ? body.extras : extras });
    if (data.ExceptionMsg !== '') {
      throw new Error(data.ExceptionMsg);
    }
    console.log(data['My_Result']);
    return data['My_Result'];
  }

  public async bookUser({
    bookedByInfoData,
    check_in,
    currency,
    extras = null,
    fromDate,
    guestData,
    pickup_info,
    propertyid,
    rooms,
    source,
    toDate,
    totalNights,
    arrivalTime,
    bookingNumber,
    defaultGuest,
    identifier,
    pr_id,
  }: IBookingParams) {
    try {
      const fromDateStr = dateToFormattedString(fromDate);
      const toDateStr = dateToFormattedString(toDate);
      let guest: any = {
        email: bookedByInfoData.email === '' ? null : bookedByInfoData.email || null,
        first_name: bookedByInfoData.firstName,
        last_name: bookedByInfoData.lastName,
        country_id: bookedByInfoData.countryId === '' ? null : bookedByInfoData.countryId,
        city: null,
        mobile: bookedByInfoData.contactNumber === null ? '' : bookedByInfoData.contactNumber,
        phone_prefix: null,
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
      if (defaultGuest) {
        guest = { ...defaultGuest, email: defaultGuest.email === '' ? null : defaultGuest.email };
      }
      if (bookedByInfoData.id) {
        guest = { ...guest, id: bookedByInfoData.id };
      }
      const body = {
        assign_units: true,
        check_in,
        is_pms: true,
        is_direct: true,
        is_in_loyalty_mode: false,
        promo_key: null,
        extras,
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
          arrival: { code: arrivalTime ? arrivalTime : bookedByInfoData.selectedArrivalTime },

          guest,
          rooms: [
            ...guestData.map(data => ({
              identifier: identifier || null,
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
              unit: typeof pr_id === 'undefined' && data.roomId === '' ? null : { id: +pr_id || +data.roomId },
              occupancy: {
                adult_nbr: data.adultCount,
                children_nbr: data.childrenCount,
                infant_nbr: null,
              },
              bed_preference: data.preference,
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
            ...rooms,
          ],
        },
        pickup_info,
      };
      console.log('book user payload', body);
      // const result = await this.doReservation(body);
      // return result;
    } catch (error) {
      console.error(error);
      throw new Error(error);
    }
  }
}
