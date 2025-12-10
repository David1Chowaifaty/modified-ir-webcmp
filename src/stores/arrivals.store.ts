import { Booking, Room } from '@/models/booking.dto';
import { canCheckIn } from '@/utils/utils';
import { createStore } from '@stencil/store';
import moment from 'moment';

export interface ArrivalsPagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface ArrivalsStore {
  bookings: Booking[];
  filteredBookings: Booking[];
  paginatedBookings: Booking[];
  needsCheckInBookings: Booking[];
  inHouseBookings: Booking[];
  futureBookings: Booking[];
  searchTerm: string;
  pagination: ArrivalsPagination;
  today: string;
}

const initialState: ArrivalsStore = {
  bookings: [],
  filteredBookings: [],
  paginatedBookings: [],
  futureBookings: [],
  needsCheckInBookings: [],
  inHouseBookings: [],
  searchTerm: '',
  pagination: {
    page: 1,
    pageSize: 20,
    total: 0,
    totalPages: 1,
  },
  today: getTodayString(),
};

export const { state: arrivalsStore, onChange: onArrivalsStoreChange } = createStore<ArrivalsStore>(initialState);

export function initializeArrivalsStore(bookings: Booking[] = []) {
  arrivalsStore.bookings = Array.isArray(bookings) ? [...bookings] : [];
  runArrivalsPipeline();
}

export function setArrivalsSearchTerm(term: string) {
  arrivalsStore.searchTerm = term ?? '';
  runArrivalsPipeline();
}

export function setArrivalsPage(page: number) {
  const safePage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
  arrivalsStore.pagination = { ...arrivalsStore.pagination, page: safePage };
  runArrivalsPipeline();
}
export function setArrivalsTotal(total: number) {
  const totalPages = total === 0 ? 1 : Math.ceil(total / arrivalsStore.pagination.pageSize);
  arrivalsStore.pagination = { ...arrivalsStore.pagination, total, totalPages };
}
export function setArrivalsPageSize(pageSize: number) {
  if (!Number.isFinite(pageSize) || pageSize <= 0) {
    return;
  }
  arrivalsStore.pagination = { ...arrivalsStore.pagination, pageSize: Math.floor(pageSize), page: 1 };
  runArrivalsPipeline();
}

export function setArrivalsReferenceDate(date: string) {
  arrivalsStore.today = moment(date, 'YYYY-MM-DD').format('YYYY-MM-DD');
  runArrivalsPipeline();
}

function runArrivalsPipeline() {
  const bookingsForToday = getBookingsForDate(arrivalsStore.bookings, arrivalsStore.today);
  const searchedBookings = filterBookingsBySearch(bookingsForToday, arrivalsStore.searchTerm);

  arrivalsStore.filteredBookings = searchedBookings;
  arrivalsStore.paginatedBookings = searchedBookings;
  console.log(searchedBookings);
  const split = splitBookingsByStatus(searchedBookings);
  console.log(split);
  arrivalsStore.needsCheckInBookings = split.needsCheckIn;
  arrivalsStore.inHouseBookings = split.inHouse;
  arrivalsStore.futureBookings = split.futureRooms;
}

function getBookingsForDate(bookings: Booking[], date: string) {
  if (!date) {
    return [];
  }
  return bookings;
}

function filterBookingsBySearch(bookings: Booking[], term: string) {
  const normalizedTerm = term?.trim().toLowerCase();
  if (!normalizedTerm) {
    return bookings;
  }
  return bookings.filter(booking => matchesSearchTerm(booking, normalizedTerm));
}

function matchesSearchTerm(booking: Booking, term: string) {
  if (!term) {
    return true;
  }
  const bookingNumber = booking.booking_nbr?.toLowerCase() ?? '';
  if (bookingNumber.includes(term)) {
    return true;
  }
  if (buildName(booking.guest).includes(term)) {
    return true;
  }
  return (booking.rooms ?? []).some(room => buildName(room.guest).includes(term));
}

function splitBookingsByStatus(bookings: Booking[]) {
  return bookings.reduce(
    (acc, booking) => {
      const rooms = booking.rooms ?? [];
      const needsCheckInRooms = rooms.filter(room => isNeedsCheckIn(room));
      if (needsCheckInRooms.length) {
        acc.needsCheckIn.push({ ...booking, rooms: needsCheckInRooms });
      }
      const inHouseRooms = rooms.filter(room => isInHouse(room));
      if (inHouseRooms.length) {
        acc.inHouse.push({ ...booking, rooms: inHouseRooms });
      }
      const futureCheckIns = rooms.filter(room => isFutureCheckIn(room));
      if (futureCheckIns.length) {
        acc.futureRooms.push({ ...booking, rooms: futureCheckIns });
      }
      return acc;
    },
    { needsCheckIn: [] as Booking[], inHouse: [] as Booking[], futureRooms: [] as Booking[] },
  );
}

function isNeedsCheckIn(room: Room) {
  return canCheckIn({
    from_date: room.from_date,
    to_date: room.to_date,
    isCheckedIn: room.in_out.code === '001',
  });
}

function isFutureCheckIn(room: Room) {
  const code = room.in_out?.code ?? '';
  return code === '000' && moment().startOf('date').isBefore(moment(room.from_date, 'YYYY-MM-DD').startOf('day'));
}

function isInHouse(room: Room) {
  return room.in_out?.code === '001';
}

function buildName(person?: { first_name?: string | null; last_name?: string | null } | null) {
  const full = `${person?.first_name ?? ''} ${person?.last_name ?? ''}`.trim();
  return full.toLowerCase();
}

function getTodayString() {
  return moment().format('YYYY-MM-DD');
}

initializeArrivalsStore();
