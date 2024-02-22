import { CalendarDataDetails } from '@/models/calendarData';
import { createStore } from '@stencil/store';

const initialState: CalendarDataDetails = {
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
  max_nights: 0,
  is_frontdesk_enabled: false,
  taxes: [],
  id: null,
  name: '',
  token: '',
};
export const { state: calendar_data, onChange: onCalendarDatesChange } = createStore<CalendarDataDetails>(initialState);

export default calendar_data;
