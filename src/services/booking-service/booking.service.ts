import { ExposedApplicablePolicy, ExposedBookingEvent, HandleExposedRoomGuestsRequest } from '../../models/booking.dto';
import { DayData } from '../../models/DayType';
import axios from 'axios';
import { BookingDetails, IBlockUnit, ICountry, IEntries, ISetupEntries, MonthType } from '../../models/IBooking';
import { convertDateToCustomFormat, convertDateToTime, extras } from '../../utils/utils';
import { getMyBookings } from '../../utils/booking';
import { Booking, Guest, IPmsLog } from '../../models/booking.dto';
import booking_store from '@/stores/booking.store';
import calendar_data from '@/stores/calendar-data';

import { BookingInvoiceInfo, BookingInvoiceInfoSchema } from '@/components/ir-invoice/types';
import {
  BlockAvailabilityForBracketsProps,
  BlockAvailabilityForBracketsPropsSchema,
  ChangeExposedBookingStatusProps,
  ChangeExposedBookingStatusPropsSchema,
  DoBookingExtraServiceProps,
  DoBookingExtraServicePropsSchema,
  GetBookingAvailabilityProps,
  GetBookingAvailabilityPropsSchema,
  GetBookingInvoiceInfoProps,
  GetBookingInvoiceInfoPropsSchema,
  GetExposedApplicablePoliciesProps,
  GetExposedApplicablePoliciesPropsSchema,
  GetNextValueProps,
  GetNextValuePropsSchema,
  GetPenaltyStatementProps,
  GetPenaltyStatementPropsSchema,
  GroupedTableEntries,
  HandleExposedRoomInOutProps,
  HandleExposedRoomInOutPropsSchema,
  IssueInvoiceProps,
  IssueInvoicePropsSchema,
  PrintInvoiceProps,
  PrintInvoicePropsSchema,
  SetDepartureTimeProps,
  SetDepartureTimePropsSchema,
  SetExposedRestrictionPerRoomTypeProps,
  SetExposedRestrictionPerRoomTypePropsSchema,
  TableEntries,
  UnblockUnitByPeriodProps,
  UnblockUnitByPeriodPropsSchema,
  VoidInvoiceProps,
  VoidInvoicePropsSchema,
} from './types';

export class BookingService {
  public async unBlockUnitByPeriod(props: UnblockUnitByPeriodProps) {
    const payload = UnblockUnitByPeriodPropsSchema.parse(props);
    const { data } = await axios.post(`/Unblock_Unit_By_Period`, payload);
    if (data.ExceptionMsg !== '') {
      throw new Error(data.ExceptionMsg);
    }
    return data;
  }
  public async getNextValue(props: GetNextValueProps) {
    const payload = GetNextValuePropsSchema.parse(props);
    const { data } = await axios.post(`/Get_Next_Value`, payload);
    if (data.ExceptionMsg !== '') {
      throw new Error(data.ExceptionMsg);
    }
    return data;
  }
  public async getExposedApplicablePolicies(props: GetExposedApplicablePoliciesProps): Promise<ExposedApplicablePolicy[] | null> {
    const payload = GetExposedApplicablePoliciesPropsSchema.parse(props);
    const { data } = await axios.post(`/Get_Exposed_Applicable_Policies`, payload);
    if (data.ExceptionMsg !== '') {
      throw new Error(data.ExceptionMsg);
    }
    return data.My_Result ?? [];
  }

  public async handleExposedRoomInOut(props: HandleExposedRoomInOutProps) {
    const payload = HandleExposedRoomInOutPropsSchema.parse(props);
    const { data } = await axios.post(`/Handle_Exposed_Room_InOut`, payload);
    if (data.ExceptionMsg !== '') {
      throw new Error(data.ExceptionMsg);
    }
    return data;
  }
  public async GetPenaltyStatement(props: GetPenaltyStatementProps) {
    const payload = GetPenaltyStatementPropsSchema.parse(props);
    const { data } = await axios.post('/Get_Penalty_Statement', payload);
    if (data.ExceptionMsg !== '') {
      throw new Error(data.ExceptionMsg);
    }
    return data.My_Result;
  }
  public async setExposedRestrictionPerRoomType(props: SetExposedRestrictionPerRoomTypeProps) {
    const payload = SetExposedRestrictionPerRoomTypePropsSchema.parse(props);
    const { data } = await axios.post(`https://gateway.igloorooms.com/IRBE/Set_Exposed_Restriction_Per_Room_Type`, {
      ...payload,
      operation_type: payload.operation_type ?? 'close_open',
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
        My_Props_Get_Rooming_Data: {
          AC_ID: propertyid,
          FROM: data.My_Props_Get_Exposed_Calendar.from_date,
          TO: data.My_Props_Get_Exposed_Calendar.to_date,
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
  public async changeExposedBookingStatus(props: ChangeExposedBookingStatusProps) {
    try {
      const payload = ChangeExposedBookingStatusPropsSchema.parse(props);
      const { data } = await axios.post(`/Change_Exposed_Booking_Status`, payload);
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

  public async getBookingAvailability(props: GetBookingAvailabilityProps): Promise<BookingDetails> {
    try {
      const { adultChildCount, currency, ...rest } = GetBookingAvailabilityPropsSchema.parse(props);
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
  public async getSetupEntriesByTableName(TBL_NAME: TableEntries): Promise<IEntries[]> {
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
  public async doBookingExtraService(props: DoBookingExtraServiceProps) {
    const { booking_nbr, service, is_remove } = DoBookingExtraServicePropsSchema.parse(props);
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

  public async blockUnit(props: IBlockUnit) {
    try {
      const { data } = await axios.post(`/Block_Exposed_Unit`, props);
      if (data.ExceptionMsg !== '') {
        throw new Error(data.ExceptionMsg);
      }
      console.log(data);
      return data['My_Props_Block_Exposed_Unit'];
    } catch (error) {
      console.error(error);
      throw new Error(error);
    }
  }

  public async blockAvailabilityForBrackets(props: BlockAvailabilityForBracketsProps) {
    try {
      const payload = BlockAvailabilityForBracketsPropsSchema.parse(props);
      const { data } = await axios.post(`/Block_Availability_For_Brackets`, payload);
      if (data.ExceptionMsg !== '') {
        throw new Error(data.ExceptionMsg);
      }
      return data;
    } catch (error) {
      console.error(error);
      throw new Error(error);
    }
  }
  public async setDepartureTime(props: SetDepartureTimeProps) {
    const payload = SetDepartureTimePropsSchema.parse(props);
    const { data } = await axios.post('/Set_Departure_Time', payload);
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

  /* INVOICE */

  public async getBookingInvoiceInfo(props: GetBookingInvoiceInfoProps): Promise<BookingInvoiceInfo> {
    const payload = GetBookingInvoiceInfoPropsSchema.parse(props);
    const { data } = await axios.post('/Get_Booking_Invoice_Info', payload);
    return BookingInvoiceInfoSchema.parse(data.My_Result);
  }

  public async issueInvoice(props: IssueInvoiceProps) {
    const p = IssueInvoicePropsSchema.parse(props);
    const { data } = await axios.post('/Issue_Invoice', p);
    return data;
  }

  public async voidInvoice(props: VoidInvoiceProps) {
    const payload = VoidInvoicePropsSchema.parse(props);
    const { data } = await axios.post('/Void_Invoice', payload);
    return data;
  }

  public async printInvoice(props: PrintInvoiceProps) {
    const payload = PrintInvoicePropsSchema.parse(props);
    const { data } = await axios.post('/Print_Invoice', payload);
    return data;
  }
}
