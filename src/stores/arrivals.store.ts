import { Booking, Room } from '@/models/booking.dto';
import { createStore } from '@stencil/store';
import { data as arrivalsMockData } from '@/components/ir-arrivals/_data';

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
  searchTerm: string;
  pagination: ArrivalsPagination;
  today: string;
}

const initialState: ArrivalsStore = {
  bookings: [],
  filteredBookings: [],
  paginatedBookings: [],
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

export function initializeArrivalsStore(bookings: Booking[] = arrivalsMockData as any[]) {
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

export function setArrivalsPageSize(pageSize: number) {
  if (!Number.isFinite(pageSize) || pageSize <= 0) {
    return;
  }
  arrivalsStore.pagination = { ...arrivalsStore.pagination, pageSize: Math.floor(pageSize), page: 1 };
  runArrivalsPipeline();
}

export function setArrivalsReferenceDate(date: string | Date) {
  arrivalsStore.today = formatDateInput(date ?? new Date());
  runArrivalsPipeline();
}

function runArrivalsPipeline() {
  const bookingsForToday = getBookingsForDate(arrivalsStore.bookings, arrivalsStore.today);
  const searchedBookings = filterBookingsBySearch(bookingsForToday, arrivalsStore.searchTerm);

  const total = searchedBookings.length;
  const { pageSize } = arrivalsStore.pagination;
  const totalPages = total === 0 ? 1 : Math.ceil(total / pageSize);
  const safePage = clamp(arrivalsStore.pagination.page, 1, totalPages);
  const start = (safePage - 1) * pageSize;
  const paginated = searchedBookings.slice(start, start + pageSize);

  arrivalsStore.filteredBookings = searchedBookings;
  arrivalsStore.pagination = { ...arrivalsStore.pagination, total, totalPages, page: safePage };
  arrivalsStore.paginatedBookings = paginated;

  const split = splitBookingsByStatus(paginated);
  arrivalsStore.needsCheckInBookings = split.needsCheckIn;
  arrivalsStore.inHouseBookings = split.inHouse;
}

function getBookingsForDate(bookings: Booking[], date: string) {
  if (!date) {
    return [];
  }
  return bookings
    .map(booking => {
      const roomsForToday = (booking.rooms ?? []).filter(room => normalizeDate(room.from_date) === date);
      if (!roomsForToday.length) {
        return null;
      }
      return { ...booking, rooms: roomsForToday };
    })
    .filter((booking): booking is Booking => Boolean(booking));
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
      return acc;
    },
    { needsCheckIn: [] as Booking[], inHouse: [] as Booking[] },
  );
}

function isNeedsCheckIn(room: Room) {
  const code = room.in_out?.code ?? '';
  return code === '000';
}

function isInHouse(room: Room) {
  return room.in_out?.code === '001';
}

function buildName(person?: { first_name?: string | null; last_name?: string | null } | null) {
  const full = `${person?.first_name ?? ''} ${person?.last_name ?? ''}`.trim();
  return full.toLowerCase();
}

function getTodayString() {
  return formatDateInput(new Date());
}

function formatDateInput(value: string | Date) {
  if (value instanceof Date) {
    const year = value.getFullYear();
    const month = `${value.getMonth() + 1}`.padStart(2, '0');
    const day = `${value.getDate()}`.padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  return normalizeDate(value);
}

function normalizeDate(value?: string | null) {
  if (!value) {
    return '';
  }
  return value.slice(0, 10);
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

initializeArrivalsStore();
