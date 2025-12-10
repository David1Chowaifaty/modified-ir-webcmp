import { Booking, Room } from '@/models/booking.dto';
import { canCheckIn } from '@/utils/utils';
import { createStore } from '@stencil/store';
import moment from 'moment';

interface PaginationRange {
  from: number;
  to: number;
}

export interface ArrivalsPagination {
  currentPage: number;
  pageSize: number;
  total: number;
  totalPages: number;
  showing: PaginationRange;
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
    currentPage: 1,
    pageSize: 20,
    total: 0,
    totalPages: 1,
    showing: { from: 0, to: 0 },
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
  const safePage = clampPage(page, Math.max(arrivalsStore.pagination.totalPages, 1));
  arrivalsStore.pagination = {
    ...arrivalsStore.pagination,
    currentPage: safePage,
    showing: calculateShowing(safePage, arrivalsStore.pagination.pageSize, arrivalsStore.pagination.total),
  };
  runArrivalsPipeline();
}
export function setArrivalsTotal(total: number) {
  const normalizedTotal = Number.isFinite(total) && total > 0 ? Math.floor(total) : 0;
  const totalPages = calculateTotalPages(normalizedTotal, arrivalsStore.pagination.pageSize);
  const safePage = clampPage(arrivalsStore.pagination.currentPage, Math.max(totalPages, 1));
  arrivalsStore.pagination = {
    ...arrivalsStore.pagination,
    total: normalizedTotal,
    totalPages: Math.max(totalPages, 1),
    currentPage: safePage,
    showing: calculateShowing(safePage, arrivalsStore.pagination.pageSize, normalizedTotal),
  };
}
export function setArrivalsPageSize(pageSize: number) {
  if (!Number.isFinite(pageSize) || pageSize <= 0) {
    return;
  }
  const normalizedPageSize = Math.floor(pageSize);
  arrivalsStore.pagination = {
    ...arrivalsStore.pagination,
    pageSize: normalizedPageSize,
    currentPage: 1,
    showing: calculateShowing(1, normalizedPageSize, arrivalsStore.pagination.total),
  };
  runArrivalsPipeline();
}

export function setArrivalsReferenceDate(date: string) {
  arrivalsStore.today = moment(date, 'YYYY-MM-DD').format('YYYY-MM-DD');
  arrivalsStore.pagination = {
    ...arrivalsStore.pagination,
    currentPage: 1,
    showing: calculateShowing(1, arrivalsStore.pagination.pageSize, arrivalsStore.pagination.total),
  };
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

function calculateShowing(page: number, pageSize: number, total: number): PaginationRange {
  if (!total || !pageSize) {
    return { from: 0, to: 0 };
  }
  const start = (page - 1) * pageSize + 1;
  return {
    from: Math.max(start, 1),
    to: Math.min(start + pageSize - 1, total),
  };
}

function calculateTotalPages(total: number, pageSize: number) {
  if (!total || !pageSize) {
    return 0;
  }
  return Math.ceil(total / pageSize);
}

function clampPage(page: number, totalPages: number) {
  if (!Number.isFinite(page) || page <= 0) {
    return 1;
  }
  const normalizedPage = Math.floor(page);
  return Math.min(Math.max(normalizedPage, 1), Math.max(totalPages, 1));
}

initializeArrivalsStore();
