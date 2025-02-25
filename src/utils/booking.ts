import { Extras, Room } from './../models/booking.dto';
import moment from 'moment';
import { PhysicalRoomType, MonthType, CellType, STATUS, RoomBookingDetails, RoomBlockDetails } from '../models/IBooking';
import { dateDifference, isBlockUnit } from './utils';
import axios from 'axios';
import locales from '@/stores/locales.store';
import calendar_dates from '@/stores/calendar-dates.store';
import calendar_data from '@/stores/calendar-data';

export async function getMyBookings(months: MonthType[]): Promise<any[]> {
  const myBookings: any[] = [];
  const stayStatus = await getStayStatus();
  for (const month of months) {
    for (const day of month.days) {
      for (const room of day.room_types) {
        assignBooking(room.physicalrooms, myBookings, stayStatus);
      }
    }
  }

  return myBookings;
}

function assignBooking(physicalRoom: PhysicalRoomType[], myBookings: any[], stayStatus: { code: string; value: string }[]): void {
  for (const room of physicalRoom) {
    for (const key in room.calendar_cell) {
      if (room.calendar_cell[key].Is_Available === false) {
        addOrUpdateBooking(room.calendar_cell[key], myBookings, stayStatus);
      }
    }
  }
}
const status: Record<string, STATUS> = {
  '004': 'BLOCKED',
  '003': 'BLOCKED-WITH-DATES',
  '002': 'BLOCKED',
};
export const bookingStatus: Record<string, STATUS> = {
  '000': 'IN-HOUSE',
  '001': 'PENDING-CONFIRMATION',
  '002': 'CONFIRMED',
  '003': 'CHECKED-OUT',
};

export function formatName(firstName: string | null, lastName: string | null) {
  if (firstName === null && lastName === null) return '';
  if (lastName !== null && lastName !== '') {
    return `${firstName ?? ''} , ${lastName ?? ''}`;
  }
  return firstName;
}
async function getStayStatus() {
  try {
    const { data } = await axios.post(`/Get_Setup_Entries_By_TBL_NAME_Multi`, {
      TBL_NAMES: ['_STAY_STATUS'],
    });
    return data.My_Result.map(d => ({
      code: d.CODE_NAME,
      value: d.CODE_VALUE_EN,
    }));
  } catch (error) {
    console.log(error);
  }
}
function renderBlock003Date(date, hour, minute) {
  const dt = new Date(date);
  dt.setHours(hour);
  dt.setMinutes(minute);
  return `${locales.entries.Lcz_BlockedTill} ${moment(dt).format('MMM DD, HH:mm')}`;
}
function getDefaultData(cell: CellType, stayStatus: { code: string; value: string }[]): any {
  if (isBlockUnit(cell.STAY_STATUS_CODE)) {
    const blockedFromDate = moment(cell.My_Block_Info.from_date, 'YYYY-MM-DD').isAfter(cell.DATE) ? cell.My_Block_Info.from_date : cell.DATE;
    const blockedToDate = moment(cell.My_Block_Info.to_date, 'YYYY-MM-DD').isAfter(cell.DATE) ? cell.My_Block_Info.to_date : cell.DATE;
    return {
      ID: cell.POOL,
      NOTES: '',
      BALANCE: '',
      NAME:
        cell.My_Block_Info.NOTES !== ''
          ? cell.My_Block_Info.NOTES
          : cell.STAY_STATUS_CODE === '003'
          ? renderBlock003Date(cell.My_Block_Info.BLOCKED_TILL_DATE, cell.My_Block_Info.BLOCKED_TILL_HOUR, cell.My_Block_Info.BLOCKED_TILL_MINUTE)
          : stayStatus.find(st => st.code === cell.STAY_STATUS_CODE).value || '',
      RELEASE_AFTER_HOURS: cell.My_Block_Info.DESCRIPTION,
      PR_ID: cell.My_Block_Info.pr_id,
      ENTRY_DATE: cell.My_Block_Info.BLOCKED_TILL_DATE,
      ENTRY_HOUR: cell.My_Block_Info.BLOCKED_TILL_HOUR,
      ENTRY_MINUTE: cell.My_Block_Info.BLOCKED_TILL_MINUTE,
      OPTIONAL_REASON: cell.My_Block_Info.NOTES,
      FROM_DATE: blockedFromDate,
      TO_DATE: blockedToDate,
      NO_OF_DAYS: dateDifference(blockedFromDate, blockedToDate),
      STATUS: status[cell.STAY_STATUS_CODE],
      POOL: cell.POOL,
      STATUS_CODE: cell.STAY_STATUS_CODE,
      OUT_OF_SERVICE: cell.STAY_STATUS_CODE === '004',
      FROM_DATE_STR: cell.My_Block_Info.format.from_date,
      TO_DATE_STR: cell.My_Block_Info.format.to_date,
      defaultDates: {
        from_date: cell.My_Block_Info.from_date,
        to_date: cell.My_Block_Info.to_date,
      },
    };
  }
  if (cell.booking.booking_nbr.toString() === '77054273380') {
    console.log('booking', cell);
  }

  // if (cell.booking.booking_nbr === '61249849') {
  //   console.log('cell');
  //   console.log(moment(cell.room.from_date, 'YYYY-MM-DD').isAfter(cell.DATE) ? cell.room.from_date : cell.DATE);
  //   console.log(cell);
  // }
  const bookingFromDate = moment(cell.room.from_date, 'YYYY-MM-DD').isAfter(cell.DATE) ? cell.room.from_date : cell.DATE;
  const bookingToDate = moment(cell.room.to_date, 'YYYY-MM-DD').isAfter(cell.DATE) ? cell.room.to_date : cell.DATE;
  const mainGuest = cell.room.sharing_persons?.find(p => p.is_main);
  return {
    ID: cell.POOL,
    FROM_DATE: bookingFromDate,
    TO_DATE: bookingToDate,
    NO_OF_DAYS: dateDifference(bookingFromDate, bookingToDate),
    STATUS: bookingStatus[cell.booking?.status.code],
    NAME: formatName(mainGuest?.first_name, mainGuest.last_name),
    IDENTIFIER: cell.room.identifier,
    PR_ID: cell.pr_id,
    POOL: cell.POOL,
    BOOKING_NUMBER: cell.booking.booking_nbr,
    NOTES: cell.booking.is_direct ? cell.booking.remark : null,
    PRIVATE_NOTE: getPrivateNote(cell.booking.extras),
    is_direct: cell.booking.is_direct,
    BALANCE: cell.booking.financial?.due_amount,
    channel_booking_nbr: cell.booking.channel_booking_nbr,
    ARRIVAL_TIME: cell.booking.arrival.description,
    defaultDates: {
      from_date: cell.room.from_date,
      to_date: cell.room.to_date,
    },
    ///from here
    ENTRY_DATE: cell.booking.booked_on.date,
    PHONE_PREFIX: cell.booking.guest.country_phone_prefix,
    IS_EDITABLE: cell.booking.is_editable,
    ARRIVAL: cell.booking.arrival,
    PHONE: cell.booking.guest.mobile_without_prefix ?? '',
    RATE: cell.room.total,
    RATE_PLAN: cell.room.rateplan.name,
    SPLIT_BOOKING: false,
    RATE_PLAN_ID: cell.room.rateplan.id,
    RATE_TYPE: 1,
    ADULTS_COUNT: cell.room.occupancy.adult_nbr,
    CHILDREN_COUNT: cell.room.occupancy.children_nbr,
    origin: cell.booking.origin,
    GUEST: cell.booking.guest,
    ROOMS: cell.booking.rooms,
    cancelation: cell.room.rateplan.cancelation,
    guarantee: cell.room.rateplan.guarantee,
    TOTAL_PRICE: cell.booking.financial?.gross_total,
    COUNTRY: cell.booking.guest.country_id,
    FROM_DATE_STR: cell.booking.format.from_date,
    TO_DATE_STR: cell.booking.format.to_date,
    adult_child_offering: cell.room.rateplan.selected_variation.adult_child_offering,
    SOURCE: { code: cell.booking.source.code, description: cell.booking.source.description, tag: cell.booking.source.tag },
    //TODO:Implement checkin-checkout
    CHECKIN: cell.room.in_out?.code === '001',
    CHECKOUT: cell.room.in_out?.code === '002',
    ROOM_INFO: {
      occupancy: cell.room.occupancy,
      sharing_persons: cell.room.sharing_persons,
      unit: cell.room.unit,
      in_out: cell.room.in_out,
    },
    BASE_STATUS_CODE: cell.booking.status?.code,
  };
}

// function updateBookingWithStayData(data: any, cell: CellType): any {
//   data.NO_OF_DAYS = dateDifference(data.FROM_DATE, cell.DATE);
//   data.TO_DATE = cell.DATE;
//   if (cell.booking) {
//     const { arrival } = cell.booking;
//     if (cell.booking.booking_nbr === '88231897') {
//       console.log(data.NO_OF_DAYS, data.TO_DATE);
//     }
//     Object.assign(data, {
//       ARRIVAL_TIME: arrival.description,
//     });
//   }
//   return data;
// }
export function getRoomStatus(params: Pick<Room, 'in_out' | 'from_date' | 'to_date'> & { status_code: string }) {
  const { in_out, status_code, from_date, to_date } = params;
  if (calendar_data.checkin_enabled) {
    if (in_out?.code === '001') {
      return bookingStatus['000'];
    } else if (in_out?.code === '002') {
      console.log(calendar_data.is_automatic_check_in_out);
      if (!calendar_data.is_automatic_check_in_out) {
        const now = moment();
        const toDate = moment(to_date, 'YYYY-MM-DD');
        const fromDate = moment(from_date, 'YYYY-MM-DD');
        if (now.isSame(toDate, 'days') && now.isAfter(fromDate, 'days') && now.hour() >= 12) {
          return bookingStatus['003'];
        } else {
          return bookingStatus['002'];
        }
      }
      return bookingStatus['003'];
    }
    return bookingStatus[status_code || '001'];
  } else {
    const now = moment();
    const toDate = moment(to_date, 'YYYY-MM-DD');
    const fromDate = moment(from_date, 'YYYY-MM-DD');
    if (fromDate.isSame(now, 'day') && now.hour() >= 12) {
      return bookingStatus['000'];
    } else if (now.isAfter(fromDate, 'day') && now.isBefore(toDate, 'day')) {
      return bookingStatus['000'];
    } else if (toDate.isSame(now, 'day') && now.hour() < 12) {
      return bookingStatus['000'];
    } else if ((toDate.isSame(now, 'day') && now.hour() >= 12) || toDate.isBefore(now, 'day')) {
      return bookingStatus['003'];
    } else {
      return bookingStatus[status_code || '001'];
    }
  }
}
function addOrUpdateBooking(cell: CellType, myBookings: any[], stayStatus: { code: string; value: string }[]): void {
  const index = myBookings.findIndex(booking => booking.POOL === cell.POOL);
  if (index === -1) {
    const newData = getDefaultData(cell, stayStatus);
    myBookings.push(newData);
  }
  //else {
  //   const updatedData = updateBookingWithStayData(myBookings[index], cell);
  //   myBookings[index] = updatedData;
  // }
}
export function getPrivateNote(extras: Extras[] | null) {
  if (!extras) {
    return null;
  }
  return extras.find(e => e.key === 'private_note')?.value || null;
}
export function transformNewBooking(data: any): RoomBookingDetails[] {
  let bookings: RoomBookingDetails[] = [];
  const rooms = data.rooms.filter(room => !!room['assigned_units_pool']);
  rooms.forEach(room => {
    const bookingFromDate = moment(room.from_date, 'YYYY-MM-DD').isAfter(moment(calendar_dates.fromDate, 'YYYY-MM-DD')) ? room.from_date : calendar_dates.fromDate;
    const bookingToDate = room.to_date;
    if (moment(room.to_date, 'YYYY-MM-DD').isBefore(moment(calendar_dates.fromDate, 'YYYY-MM-DD'))) {
      return;
    }
    const mainGuest = room.sharing_persons?.find(p => p.is_main);
    // console.log('bookingToDate:', bookingToDate, 'bookingFromDate:', bookingFromDate, 'room from date:', room.from_date, 'room to date', room.to_date);
    bookings.push({
      CHECKIN: false,
      CHECKOUT: false,
      ID: room['assigned_units_pool'],
      TO_DATE: bookingToDate,
      FROM_DATE: bookingFromDate,
      PRIVATE_NOTE: getPrivateNote(data.extras),
      NO_OF_DAYS: dateDifference(bookingFromDate, bookingToDate),
      ARRIVAL: data.arrival,
      IS_EDITABLE: true,
      BALANCE: data.financial?.due_amount,
      STATUS: getRoomStatus({
        in_out: room.in_out,
        from_date: room.from_date,
        to_date: room.to_date,
        status_code: data.status?.code,
      }),
      NAME: formatName(mainGuest?.first_name, mainGuest.last_name),
      PHONE: data.guest.mobile_without_prefix ?? '',
      ENTRY_DATE: '12-12-2023',
      PHONE_PREFIX: data.guest.country_phone_prefix,
      RATE: room.total,
      RATE_PLAN: room.rateplan.name,
      SPLIT_BOOKING: false,
      RATE_PLAN_ID: room.rateplan.id,
      IDENTIFIER: room.identifier,
      RATE_TYPE: room.roomtype.id,
      ADULTS_COUNT: room.occupancy.adult_nbr,
      CHILDREN_COUNT: room.occupancy.children_nbr,
      PR_ID: +room.unit.id,
      POOL: room['assigned_units_pool'],
      GUEST: data.guest,
      ROOMS: data.rooms,
      BOOKING_NUMBER: data.booking_nbr,
      cancelation: room.rateplan.cancelation,
      guarantee: room.rateplan.guarantee,
      TOTAL_PRICE: data.financial?.gross_total,
      COUNTRY: data.guest.country_id,
      FROM_DATE_STR: data.format.from_date,
      TO_DATE_STR: data.format.to_date,
      adult_child_offering: room.rateplan.selected_variation.adult_child_offering,
      ARRIVAL_TIME: data.arrival.description,
      origin: data.origin,
      channel_booking_nbr: data.channel_booking_nbr,
      is_direct: data.is_direct,
      NOTES: data.is_direct ? data.remark : null,
      SOURCE: { code: data.source.code, description: data.source.description, tag: data.source.tag },
      ota_notes: data.ota_notes,
      defaultDates: {
        from_date: room.from_date,
        to_date: room.to_date,
      },
      ROOM_INFO: {
        occupancy: room.occupancy,
        sharing_persons: room.sharing_persons,
        unit: room.unit,
        in_out: room.in_out,
      },
      BASE_STATUS_CODE: data.status?.code,
    });
  });
  return bookings;
}
export async function transformNewBLockedRooms(data: any): Promise<RoomBlockDetails> {
  const stayStatus = await getStayStatus();
  return {
    ID: data.POOL,
    NOTES: '',
    BALANCE: '',
    NAME:
      data.NOTES !== ''
        ? data.NOTES
        : data.STAY_STATUS_CODE === '003'
        ? renderBlock003Date(data.BLOCKED_TILL_DATE, data.BLOCKED_TILL_HOUR, data.BLOCKED_TILL_MINUTE)
        : stayStatus.find(st => st.code === data.STAY_STATUS_CODE).value || '',
    RELEASE_AFTER_HOURS: data.DESCRIPTION,
    PR_ID: data.pr_id,
    ENTRY_DATE: data.BLOCKED_TILL_DATE,
    ENTRY_HOUR: data.BLOCKED_TILL_HOUR,
    ENTRY_MINUTE: data.BLOCKED_TILL_MINUTE,
    OPTIONAL_REASON: data.NOTES,
    FROM_DATE: data.from_date,
    TO_DATE: data.to_date,
    NO_OF_DAYS: calculateDaysBetweenDates(data.from_date, data.to_date),
    STATUS: status[data.STAY_STATUS_CODE],
    POOL: data.POOL,
    STATUS_CODE: data.STAY_STATUS_CODE,
    OUT_OF_SERVICE: data.STAY_STATUS_CODE === '004',
    FROM_DATE_STR: data.format.from_date,
    TO_DATE_STR: data.format.to_date,
    defaultDates: {
      from_date: data.from_date,
      to_date: data.to_date,
    },
  };
}
export function calculateDaysBetweenDates(from_date: string, to_date: string) {
  const startDate = moment(from_date, 'YYYY-MM-DD');
  const endDate = moment(to_date, 'YYYY-MM-DD');
  const daysDiff = endDate.diff(startDate, 'days');
  return daysDiff || 1;
}
