import { RoomBlockDetails, RoomBookingDetails } from '@/components';
import { calculateDaysBetweenDates } from '@/utils/booking';
import { createStore } from '@stencil/store';
import moment from 'moment';

export interface IBookingStore {
  bookings: (RoomBookingDetails | RoomBlockDetails)[];
}
const initialState: IBookingStore = {
  bookings: [],
};
export const { state: booking_store } = createStore<IBookingStore>(initialState);

export function getBookings() {
  return booking_store.bookings;
}
export function addBookings(data: (RoomBookingDetails | RoomBlockDetails)[]) {
  const currentBookings = [...getBookings()];
  const bookingMap = new Map(currentBookings.map(booking => [booking.ID, booking]));

  const now = moment();
  data.forEach(newBooking => {
    const existingBooking = bookingMap.get(newBooking.ID);
    if (existingBooking) {
      if (new Date(newBooking.FROM_DATE) > new Date(existingBooking.FROM_DATE)) {
        existingBooking.FROM_DATE = newBooking.FROM_DATE;
      } else {
        existingBooking.TO_DATE = newBooking.TO_DATE;
      }
      existingBooking.NO_OF_DAYS = calculateDaysBetweenDates(existingBooking.FROM_DATE, existingBooking.TO_DATE);
    } else {
      bookingMap.set(newBooking.ID, newBooking);
      newBooking.NO_OF_DAYS = calculateDaysBetweenDates(newBooking.FROM_DATE, newBooking.TO_DATE);
    }
    // newBooking.legendData = calendar_data.formattedLegendData;
    // newBooking.defaultDateRange = {
    //   fromDate: new Date(newBooking.FROM_DATE + 'T00:00:00'),
    //   toDate: new Date(newBooking.TO_DATE + 'T00:00:00'),
    // };
    // newBooking.defaultDateRange.fromDateStr = getDateStr(newBooking.defaultDateRange.fromDate);
    // newBooking.defaultDateRange.fromDateTimeStamp = newBooking.defaultDateRange.fromDate.getTime();
    // newBooking.defaultDateRange.toDateStr = getDateStr(newBooking.defaultDateRange.toDate);
    // newBooking.defaultDateRange.toDateTimeStamp = newBooking.defaultDateRange.toDate.getTime();
    // newBooking.defaultDateRange.dateDifference = calculateDaysBetweenDates(newBooking.FROM_DATE, newBooking.TO_DATE);
    // newBooking.roomsInfo = [...calendar_data.roomsInfo];
  });
  booking_store.bookings = Array.from(bookingMap.values());
}
export default booking_store;
