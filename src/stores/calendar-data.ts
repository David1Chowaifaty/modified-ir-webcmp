import { CalendarDataDetails } from '@/models/calendarData';
import { createStore } from '@stencil/store';

type CalendarStore = CalendarDataDetails & { roomHistory: Record<string, boolean>; checkin_enabled: boolean };
const initialState: CalendarStore = {
  adultChildConstraints: {
    adult_max_nbr: 0,
    child_max_nbr: 0,
    child_max_age: 0,
  },
  allowedBookingSources: [],
  currency: undefined,
  endingDate: 0,
  formattedLegendData: undefined,
  is_vacation_rental: false,
  legendData: [],
  roomsInfo: [],
  startingDate: 0,
  language: '',
  toBeAssignedEvents: [],
  allowed_payment_methods: [],
  pickup_service: undefined,
  checkin_enabled: false,
  max_nights: 0,
  is_frontdesk_enabled: false,
  taxes: [],
  id: null,
  name: '',
  token: '',
  tax_statement: '',
  country: undefined,
  is_pms_enabled: false,
  roomHistory: {},
};
export const { state: calendar_data, onChange: onCalendarDatesChange } = createStore<CalendarStore>(initialState);
export function isSingleUnit(id: number) {
  if (calendar_data.roomHistory[id]) {
    return calendar_data.roomHistory[id];
  }
  const roomtype = calendar_data.roomsInfo.find(r => r.id === id);
  if (!roomtype) {
    console.warn(`Room type not found for ID: ${id}`);
    return false;
  }
  const result = roomtype.physicalrooms?.length <= 1;
  calendar_data.roomHistory[id] = result;
  return result;
}
export default calendar_data;
