import { CalendarDataDetails } from '@/models/calendarData';
import { createStore } from '@stencil/store';

const { state: calendarDataState } = createStore<CalendarDataDetails>({
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
});

export default calendarDataState;
