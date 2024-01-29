import moment from 'moment';
import { PhysicalRoomType, MonthType, CellType, STATUS, RoomBookingDetails, RoomBlockDetails } from '../models/IBooking';
import { dateDifference, isBlockUnit } from './utils';
import axios from 'axios';
import locales from '@/stores/locales.store';

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
const bookingStatus: Record<string, STATUS> = {
  '000': 'IN-HOUSE',
  '001': 'PENDING-CONFIRMATION',
  '002': 'CONFIRMED',
  '003': 'CHECKED-OUT',
};

export function formatName(firstName: string | null, lastName: string | null) {
  if (firstName === null && lastName === null) return '';
  if (lastName !== null) {
    return `${firstName ?? ''} , ${lastName ?? ''}`;
  }
  return firstName;
}
async function getStayStatus() {
  try {
    const token = JSON.parse(sessionStorage.getItem('token'));
    if (token) {
      const { data } = await axios.post(`/Get_Setup_Entries_By_TBL_NAME_Multi?Ticket=${token}`, {
        TBL_NAMES: ['_STAY_STATUS'],
      });
      return data.My_Result.map(d => ({
        code: d.CODE_NAME,
        value: d.CODE_VALUE_EN,
      }));
    } else {
      throw new Error('Invalid Token');
    }
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
      FROM_DATE: cell.DATE,
      TO_DATE: cell.DATE,
      NO_OF_DAYS: 1,
      STATUS: status[cell.STAY_STATUS_CODE],
      POOL: cell.POOL,
      STATUS_CODE: cell.STAY_STATUS_CODE,
      OUT_OF_SERVICE: cell.STAY_STATUS_CODE === '004',
      FROM_DATE_STR: cell.My_Block_Info.format.from_date,
      TO_DATE_STR: cell.My_Block_Info.format.to_date,
    };
  }
  //console.log('booking', cell);
  return {
    ID: cell.POOL,
    TO_DATE: cell.DATE,
    FROM_DATE: cell.DATE,
    NO_OF_DAYS: 1,
    STATUS: bookingStatus[moment(cell.DATE, 'YYYY-MM-DD').isSameOrBefore(moment()) ? '000' : cell.booking?.status.code],
    NAME: formatName(cell.room.guest.first_name, cell.room.guest.last_name),
    IDENTIFIER: cell.room.identifier,
    PR_ID: cell.pr_id,
    POOL: cell.POOL,
    BOOKING_NUMBER: cell.booking.booking_nbr,
    NOTES: cell.booking.remark,
    is_direct: cell.booking.is_direct,
    BALANCE: cell.booking.financial?.due_amount,
    ///from here
    //ENTRY_DATE: cell.booking.booked_on.date,
    // IS_EDITABLE: cell.booking.is_editable,
    // ARRIVAL: cell.booking.arrival,
    // PHONE: cell.booking.guest.mobile ?? '',
    // RATE: cell.room.total,
    // RATE_PLAN: cell.room.rateplan.name,
    // SPLIT_BOOKING: false,
    // RATE_PLAN_ID: cell.room.rateplan.id,
    // RATE_TYPE: 1,
    // ADULTS_COUNT: cell.room.occupancy.adult_nbr,
    // CHILDREN_COUNT: cell.room.occupancy.children_nbr,
    // channel_booking_nbr: cell.booking.channel_booking_nbr,
    // origin: cell.booking.origin,
    // GUEST: cell.booking.guest,
    // ROOMS: cell.booking.rooms,
    // cancelation: cell.room.rateplan.cancelation,
    // guarantee: cell.room.rateplan.guarantee,
    // TOTAL_PRICE: cell.room.total,
    // COUNTRY: cell.booking.guest.country_id,
    // FROM_DATE_STR: cell.booking.format.from_date,
    // TO_DATE_STR: cell.booking.format.to_date,
    // adult_child_offering: cell.room.rateplan.selected_variation.adult_child_offering,
    // SOURCE: { code: cell.booking.source.code, description: cell.booking.source.description, tag: cell.booking.source.tag },
  };
}

// function updateBookingWithStayData(data: any, cell: CellType): any {
//   data.NO_OF_DAYS = dateDifference(data.FROM_DATE, cell.DATE);
//   data.TO_DATE = cell.DATE;
//   if (!isBlockUnit(cell.STAY_STATUS_CODE)) {
//     const now = moment();
//     const toDate = moment(data.TO_DATE, 'YYYY-MM-DD');
//     if (toDate.isBefore(now, 'day') || (toDate.isSame(now, 'day') && now.hour() >= 12)) {
//       data.STATUS = bookingStatus['003'];
//     } else if (data.STATUS !== '000') {
//       data.STATUS = bookingStatus[moment(cell.DATE, 'YYYY-MM-DD').isSameOrBefore(moment()) ? '000' : cell.booking?.status.code];
//     }
//   }
//   if (cell.booking) {
//     const { arrival } = cell.booking;
//     Object.assign(data, {
//       ARRIVAL_TIME: arrival.description,
//     });
//   }

//   return data;
// }
function updateBookingWithStayData(data: any, cell: CellType): any {
  data.NO_OF_DAYS = dateDifference(data.FROM_DATE, cell.DATE);
  data.TO_DATE = cell.DATE;
  if (data.status !== '000') {
    if (!isBlockUnit(cell.STAY_STATUS_CODE)) {
      const now = moment();
      const toDate = moment(data.TO_DATE, 'YYYY-MM-DD');

      if (toDate.isSame(now, 'day')) {
        if (now.hour() >= 12) {
          data.STATUS = '000';
        } else {
          data.STATUS = data.STATUS === '000' ? '000' : bookingStatus[moment(cell.DATE, 'YYYY-MM-DD').isSameOrBefore(now) ? '000' : cell.booking?.status.code];
        }
      } else if (toDate.isBefore(now, 'day')) {
        data.STATUS = bookingStatus['003'];
      } else {
        data.STATUS = bookingStatus[moment(cell.DATE, 'YYYY-MM-DD').isSameOrBefore(now) ? '000' : cell.booking?.status.code];
      }
    }
  }

  if (cell.booking) {
    const { arrival } = cell.booking;
    Object.assign(data, {
      ARRIVAL_TIME: arrival.description,
    });
  }

  return data;
}

function addOrUpdateBooking(cell: CellType, myBookings: any[], stayStatus: { code: string; value: string }[]): void {
  const index = myBookings.findIndex(booking => booking.POOL === cell.POOL);

  if (index === -1) {
    const newData = getDefaultData(cell, stayStatus);
    myBookings.push(newData);
  } else {
    const updatedData = updateBookingWithStayData(myBookings[index], cell);
    myBookings[index] = updatedData;
  }
}
export function transformNewBooking(data: any): RoomBookingDetails[] {
  let bookings: RoomBookingDetails[] = [];
  console.log(data);
  const renderStatus = room => {
    const now = moment();
    const toDate = moment(room.to_date, 'YYYY-MM-DD');
    const fromDate = moment(room.from_date, 'YYYY-MM-DD');
    if (toDate.isBefore(now, 'day') || (toDate.isSame(now, 'day') && now.hour() >= 12)) {
      return bookingStatus['003'];
    } else {
      return bookingStatus[fromDate.isSameOrBefore(now, 'day') ? '000' : data?.status.code || '001'];
    }
  };

  data.rooms.forEach(room => {
    bookings.push({
      ID: room['assigned_units_pool'],
      TO_DATE: room.to_date,
      FROM_DATE: room.from_date,
      NO_OF_DAYS: room.days.length,
      ARRIVAL: data.arrival,
      IS_EDITABLE: true,
      BALANCE: data.financial?.due_amount,
      STATUS: renderStatus(room),
      NAME: formatName(room.guest.first_name, room.guest.last_name),
      PHONE: data.guest.mobile ?? '',
      ENTRY_DATE: '12-12-2023',
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
      TOTAL_PRICE: room.total,
      COUNTRY: data.guest.country_id,
      FROM_DATE_STR: data.format.from_date,
      TO_DATE_STR: data.format.to_date,
      adult_child_offering: room.rateplan.selected_variation.adult_child_offering,
      ARRIVAL_TIME: data.arrival.description,
      origin: data.origin,
      channel_booking_nbr: data.channel_booking_nbr,
      is_direct: data.is_direct,
      NOTES: data.remark,
      SOURCE: { code: data.source.code, description: data.source.description, tag: data.source.tag },
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
  };
}
export function calculateDaysBetweenDates(from_date: string, to_date: string) {
  const startDate = moment(from_date, 'YYYY-MM-DD');
  const endDate = moment(to_date, 'YYYY-MM-DD');
  const daysDiff = endDate.diff(startDate, 'days');
  return daysDiff;
}
