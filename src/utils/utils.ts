import moment, { MomentFormatSpecification } from 'moment';
import IBooking, { ICountry, PhysicalRoomType, PropertyRoomType } from '../models/IBooking';
import { z } from 'zod';
import { compareTime, createDateWithOffsetAndHour } from '@/utils/booking';
import calendarData from '@/stores/calendar-data';
import locales from '@/stores/locales.store';

export function convertDateToCustomFormat(dayWithWeekday: string, monthWithYear: string, format: string = 'D_M_YYYY'): string {
  const dateStr = `${dayWithWeekday.split(' ')[1]} ${monthWithYear}`;
  const date = moment(dateStr, 'DD MMM YYYY');
  if (!date.isValid()) {
    throw new Error('Invalid Date');
  }
  return date.format(format);
}

export function convertDateToTime(dayWithWeekday: string, monthWithYear: string): number {
  const date = moment(dayWithWeekday + ' ' + monthWithYear, 'ddd DD MMM YYYY').toDate();
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

export interface SelectOption {
  text: string;
  value: string;
  custom_text: string | null;
}

interface CheckMealPlanParams {
  rateplan_id: string;
  roomTypes?: PropertyRoomType[] | null;
  roomTypeId?: number | null;
}

/**
 * Determines whether the currently selected room's rateplan is valid for the
 * chosen room type. If it is **not** valid, this returns the list of
 * alternative (active) rateplans that the user can switch to.
 *
 * #### Return contract
 * - **`null`** → No UI action required. Either:
 *   - no `roomTypeId`/`roomTypes`/room type found, or
 *   - the room already has a compatible active rateplan for this room type.
 * - **`SelectOption[]`** → The current rateplan doesn't exist (or isn't active)
 *   for the chosen room type. Render these options so the user can pick one.
 *
 * #### Matching rules
 * A rateplan is considered compatible if **all** of the following match:
 * - `meal_plan.code`
 * - `custom_text`
 * - `is_active === true`
 * - `is_non_refundable` (boolean equality)
 *
 * #### Edge cases handled
 * - Missing/invalid `roomTypeId` or `roomTypes`
 * - rateplan_id type not found or has no `rateplans`
 * - Partial/undefined fields on `rateplan` (safe optional access)
 * - Localized "Non-Refundable" label missing (falls back to literal)
 * - Filters out inactive rateplans and guarantees unique options by `id`
 *
 * @param params.rateplan_id       The room currently being edited/validated.
 * @param params.roomTypes  All property room types (may be null/undefined).
 * @param params.roomTypeId The selected room type id (may be null/undefined).
 *
 * @returns `null` if no choices are needed; otherwise a list of choices.
 */
export function checkMealPlan({ rateplan_id, roomTypes, roomTypeId }: CheckMealPlanParams): SelectOption | SelectOption[] | null {
  if (!roomTypeId || !Array.isArray(roomTypes) || roomTypes.length === 0) {
    return null;
  }
  const roomtype = roomTypes.find(rt => rt?.id === roomTypeId);
  if (!roomtype || !Array.isArray(roomtype.rateplans) || roomtype.rateplans.length === 0) {
    return null;
  }
  const rateplan = (() => {
    for (const rt of roomTypes) {
      const ratePlan = rt.rateplans.find(rp => rp.id.toString() === rateplan_id.toString());
      if (ratePlan) {
        return ratePlan;
      }
    }
    return null;
  })();
  const current = {
    mealPlanCode: rateplan?.meal_plan?.code ?? null,
    customText: rateplan?.custom_text ?? null,
    isNonRefundable: Boolean(rateplan?.is_non_refundable),
  };
  const hasCompatibleActiveRateplan = roomtype.rateplans.some(
    rp =>
      Boolean(rp?.is_active) &&
      (rp?.meal_plan?.code ?? null) === current.mealPlanCode &&
      (rp?.custom_text ?? null) === current.customText &&
      Boolean(rp?.is_non_refundable) === current.isNonRefundable,
  );

  if (hasCompatibleActiveRateplan) {
    const rp = roomtype.rateplans.find(
      rp =>
        Boolean(rp?.is_active) &&
        (rp?.meal_plan?.code ?? null) === current.mealPlanCode &&
        (rp?.custom_text ?? null) === current.customText &&
        Boolean(rp?.is_non_refundable) === current.isNonRefundable,
    );
    return {
      custom_text: rp.custom_text,
      text: rp.short_name,
      value: rp.id.toString(),
    };
  }
  const nonRefundableLabel = locales?.entries?.Lcz_NonRefundable ?? 'Non-Refundable';
  const seen = new Set<number>();
  const options: SelectOption[] = [];
  for (const rp of roomtype.rateplans) {
    if (!rp || !rp.is_active || seen.has(rp.id)) continue;

    seen.add(rp.id);

    const suffix = rp.is_non_refundable ? ` ${nonRefundableLabel}` : '';
    const text = `${rp.short_name ?? ''}${suffix}`.trim();

    if (!text) continue;

    options.push({
      text,
      custom_text: rp.custom_text,
      value: String(rp.id),
    });
  }
  return options;
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
  return currency + ' ' + amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
/**
 * Determines whether the given user has privileged (global or elevated) access.
 *
 * Privileged users are typically system administrators or MPO users
 * who can access data across all properties rather than being restricted
 * to a specific property.
 *
 * @param userTypeCode - Numeric code representing the user's role.
 *   - `1` → Super Admin
 *   - `4` → MPO (Multi-Property Operator)
 *
 * @returns `true` if the user has elevated/global access, otherwise `false`.
 *
 * @example
 * ```ts
 * isPrivilegedUser(1); // true (Super Admin)
 * isPrivilegedUser(4); // true (MPO)
 * isPrivilegedUser(2); // false
 * ```
 */
export const isPrivilegedUser = (userTypeCode: number): boolean => {
  // User type codes that have global or elevated access
  const privilegedUserTypes = [1, 4]; // 4 = MPO, 1 = Super Admin
  return privilegedUserTypes.includes(userTypeCode);
};

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

export interface CheckInParams {
  from_date: string;
  to_date: string;
  isCheckedIn?: boolean;
}

/**
 * Determines whether a booking is eligible for check-in.
 *
 * @param params - An object containing the booking event, calendar data, current check-in status, and a flag indicating if check-in or checkout is allowed.
 * @returns True if check-in is allowed; otherwise, false.
 */
export function canCheckIn({ from_date, to_date, isCheckedIn }: CheckInParams): boolean {
  if (!calendarData.checkin_enabled || calendarData.is_automatic_check_in_out) {
    return false;
  }
  if (isCheckedIn) {
    return false;
  }
  const now = moment();
  if (
    (moment().isSameOrAfter(new Date(from_date), 'days') && moment().isBefore(new Date(to_date), 'days')) ||
    (moment().isSame(new Date(to_date), 'days') &&
      !compareTime(now.toDate(), createDateWithOffsetAndHour(calendarData.checkin_checkout_hours?.offset, calendarData.checkin_checkout_hours?.hour)))
  ) {
    return true;
  }
  return false;
}
/**
 * Downloads a file from a given URL.
 *
 * @param url - The URL of the file to download.
 * @param filename - The name of the file to save. If not provided, the URL will be used as the filename.
 */
export function downloadFile(url: string, filename?: string) {
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || url;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
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

export async function sleep(time: number = 200) {
  return new Promise(r => setTimeout(() => r(null), time));
}
export function handleBodyOverflow(open: boolean) {
  const attr = 'data-ir-scroll-locked';
  let counter = document.body.getAttribute(attr);
  if (!document.getElementById('scroll-lock-style')) {
    const style = document.createElement('style');
    style.id = 'scroll-lock-style';
    style.innerHTML = `
      body:dir(ltr)[data-ir-scroll-locked] {
        overflow: hidden !important;
        overscroll-behavior: contain;
        position: relative !important;
        padding-left: 0px;
        padding-top: 0px;
        padding-right: 0px;
        margin-left: 0;
        margin-top: 0;
        margin-right: 15px !important;
      }
      body:dir(rtl)[data-ir-scroll-locked] {
        overflow: hidden !important;
        overscroll-behavior: contain;
        position: relative !important;
        padding-left: 0px;
        padding-top: 0px;
        padding-right: 0px;
        margin-right: 0;
        margin-top: 0;
        margin-left: 15px !important;
      }
    `;
    document.head.appendChild(style);
  }
  if (!counter) {
    document.body.setAttribute(attr, '1');
  } else {
    const newCount = open ? Number(counter) + 1 : Number(counter) - 1;
    document.body.setAttribute(attr, newCount.toString());
    if (newCount <= 0) {
      document.body.removeAttribute(attr);
    }
  }
}
export function generatePassword(length = 16): string {
  const CHARSET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' + 'abcdefghijklmnopqrstuvwxyz' + '0123456789' + '!@#$%^&*()-_=+[]{}|;:,.<>?';

  const cryptoObj = (window.crypto || (window as any).msCrypto) as Crypto & { getRandomValues?: Function };
  if (cryptoObj && typeof cryptoObj.getRandomValues === 'function') {
    const randomValues = new Uint32Array(length);
    cryptoObj.getRandomValues(randomValues);
    return Array.from(randomValues, rv => CHARSET[rv % CHARSET.length]).join('');
  } else {
    console.warn('Secure crypto RNG not available—falling back to Math.random()');
    let password = '';
    for (let i = 0; i < length; i++) {
      const idx = Math.floor(Math.random() * CHARSET.length);
      password += CHARSET.charAt(idx);
    }
    return password;
  }
}
/**
 * Generates a list of time strings in military time (24-hour format) between two specified times,
 * incremented by a given number of minutes.
 *
 * @param from - Start time in "HH:mm" (24-hour/military) format (e.g., "04:00").
 * @param to - End time in "HH:mm" (24-hour/military) format (e.g., "18:00").
 * @param stepMinutes - The interval step in minutes between time slots (default is 60).
 * @returns An array of time strings in "HH:mm" format representing each step between the start and end times.
 */
export function generateTimeSlotsMilitary(from: string, to: string, stepMinutes: number = 60): string[] {
  const startTime = moment(from, 'HH:mm');
  const endTime = moment(to, 'HH:mm');

  const timeSlots: string[] = [];

  let currentTime = startTime.clone();

  while (currentTime <= endTime) {
    timeSlots.push(currentTime.format('HH:mm'));
    currentTime.add(stepMinutes, 'minutes');
  }

  return timeSlots;
}

/**
 * Checks whether a given date falls on a weekend (Saturday or Sunday).
 *
 * @param date   - The date to check, as a string (parsed using the given `format`).
 * @param format - Moment.js format used to parse `date`. Defaults to `'YYYY-MM-DD'`.
 * @returns `true` if the parsed date is a Saturday or Sunday, otherwise `false`.
 */
export function isWeekend(date: string, format: MomentFormatSpecification = 'YYYY-MM-DD'): boolean {
  const d = moment(date, format);
  return d.day() === 0 || d.day() === 6;
}
