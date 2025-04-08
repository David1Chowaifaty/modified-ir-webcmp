import moment from 'moment';
import IBooking, { ICountry, PhysicalRoomType } from '../models/IBooking';
import { z } from 'zod';

export function convertDateToCustomFormat(dayWithWeekday: string, monthWithYear: string): string {
  const dateStr = `${dayWithWeekday.split(' ')[1]} ${monthWithYear}`;
  const date = moment(dateStr, 'DD MMM YYYY');
  if (!date.isValid()) {
    throw new Error('Invalid Date');
  }
  return date.format('D_M_YYYY');
}

export function convertDateToTime(dayWithWeekday: string, monthWithYear: string): number {
  const date = moment(dayWithWeekday + ' ' + monthWithYear, 'ddd DD MMM YYYY').toDate();
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}
export function dateDifference(FROM_DATE: string, TO_DATE: string): number {
  const startDate = new Date(FROM_DATE);
  const endDate = new Date(TO_DATE);
  return Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
}
export const getBrowserLanguage = (): string => {
  const defaultLang = 'en';
  const lang = navigator.language || defaultLang;
  return lang.toUpperCase().split('-')[0];
};

export const transformBooking = (physicalRoom: PhysicalRoomType[]): IBooking[] => {
  const myBookings: IBooking[] = [];
  physicalRoom.forEach(room => {
    Object.keys(room.calendar_cell).forEach(key => {
      if (room.calendar_cell[key].Is_Available === false) {
        if (myBookings.find(b => b.ID === room.id.toString())) {
        } else {
          //myBookings.push({})
        }
      }
    });
  });
  return myBookings;
};

export function dateToFormattedString(date: Date): string {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0'); // +1 because months are 0-based in JS
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatLegendColors(legendData) {
  let formattedLegendData: any = {};

  const statusId = {
    'IN-HOUSE': { id: 1, clsName: 'IN_HOUSE' },
    'CONFIRMED': { id: 2, clsName: 'CONFIRMED' },
    'PENDING-CONFIRMATION': { id: 3, clsName: 'PENDING_CONFIRMATION' },
    'SPLIT-UNIT': { id: 4, clsName: 'SPLIT_UNIT' },
    'CHECKED-IN': { id: 5, clsName: 'CHECKED_IN' },
    'CHECKED-OUT': { id: 5, clsName: 'CHECKED_OUT' },
    'BLOCKED': { id: 6, clsName: 'BLOCKED' },
    'BLOCKED-WITH-DATES': { id: 7, clsName: 'BLOCKED_WITH_DATES' },
    'NOTES': { id: 8, clsName: 'NOTES' },
    'OUTSTANDING-BALANCE': { id: 9, clsName: 'OUTSTANDING_BALANCE' },
    'TEMP-EVENT': { id: 10, clsName: 'PENDING_CONFIRMATION' },
  };
  legendData.forEach(legend => {
    formattedLegendData[legend.id] = legend;
    formattedLegendData.statusId = statusId; // NOTE: This will overwrite the 'statusId' property with every iteration.
  });

  return formattedLegendData;
}
export function isBlockUnit(status_code: any) {
  return ['003', '002', '004'].includes(status_code);
}
export function getCurrencySymbol(currencyCode) {
  const formatter = new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  return formatter.format(0).replace(/[0-9]/g, '').trim();
}
export const findCountry = (id: number, countries: ICountry[]): ICountry => countries.find(country => country.id === id);

export function getReleaseHoursString(releaseDate: number) {
  const dt = new Date();
  const releaseAfterHours = releaseDate;

  dt.setHours(dt.getHours() + releaseAfterHours, dt.getMinutes(), 0, 0);

  return {
    BLOCKED_TILL_DATE: dateToFormattedString(dt),
    BLOCKED_TILL_HOUR: dt.getHours().toString(),
    BLOCKED_TILL_MINUTE: dt.getMinutes().toString(),
  };
}

export function computeEndDate(startDate: string, numberOfDays: number): string {
  const dateObj = moment(startDate, 'D_M_YYYY');
  dateObj.add(numberOfDays, 'days');
  return dateObj.format('YYYY-MM-DD');
}

export function convertDMYToISO(date: string) {
  const dateObj = moment(date, 'D_M_YYYY');
  return dateObj.format('YYYY-MM-DD');
}
export function addTwoMonthToDate(date: Date) {
  return moment(date).add(2, 'months').format('YYYY-MM-DD');
}
export function formatDate(dateString, option = 'DD MMM YYYY') {
  const formattedDate = moment(dateString, option).format('ddd, DD MMM YYYY');
  return formattedDate;
}
export function getNextDay(date: Date) {
  return moment(date).add(1, 'days').format('YYYY-MM-DD');
}

export function convertDatePrice(date: string) {
  return moment(date, 'YYYY-MM-DD').format('DD/MM ddd');
}
export function getDaysArray(date1: string, date2: string) {
  let dates = [];
  let start = moment.min(moment(date1).add(1, 'days'), moment(date2));
  let end = moment.max(moment(date1), moment(date2));
  while (start < end) {
    dates.push(start.format('YYYY-MM-DD'));
    start = start.clone().add(1, 'days');
  }

  return dates;
}
export function renderTime(time: number) {
  return time < 10 ? time.toString().padStart(2, '0') : time.toString();
}
export function validateEmail(email: string) {
  if (email === '') {
    return true;
  }
  const parsedEmailResults = z.string().email().safeParse(email);
  return !parsedEmailResults.success;
}
export function formatAmount(currency: string, amount: number) {
  // const symbol = getCurrencySymbol(currency);
  return currency + amount.toFixed(2);
}
export const extras = [
  {
    key: 'private_note',
    value: '',
  },
  {
    key: 'is_backend',
    value: true,
  },
  {
    key: 'ERROR_EMAIL',
    value: '',
  },
  {
    key: 'agent_payment_mode',
    value: '',
  },
  { key: 'payment_code', value: '' },
];
export function manageAnchorSession(data: Record<string, unknown>, mode: 'add' | 'remove' = 'add') {
  const anchor = JSON.parse(sessionStorage.getItem('backend_anchor'));
  if (anchor) {
    if (mode === 'add') {
      return sessionStorage.setItem('backend_anchor', JSON.stringify({ ...anchor, ...data }));
    } else if (mode === 'remove') {
      const keys = Object.keys(data);
      keys.forEach(key => {
        if (key in anchor) {
          delete anchor[key];
        }
      });
      return sessionStorage.setItem('backend_anchor', JSON.stringify(anchor));
    }
  } else {
    if (mode === 'add') {
      return sessionStorage.setItem('backend_anchor', JSON.stringify({ ...data }));
    }
  }
}
export function checkUserAuthState() {
  const anchor = JSON.parse(sessionStorage.getItem('backend_anchor'));
  if (anchor) {
    return anchor.login || null;
  }
  return null;
}
/**
 * Converts an integer value into a float by shifting the decimal point.
 *
 * @param value - The integer value to convert (e.g. 29016).
 * @param decimalPlaces - The number of decimal places to shift (e.g. 2 results in 290.16).
 * @returns The converted floating point number.
 */
export function toFloat(value: number, decimalPlaces: number): number {
  const factor = Math.pow(10, decimalPlaces);
  return value / factor;
}
