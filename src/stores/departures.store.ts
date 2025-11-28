import { Booking, Room } from '@/models/booking.dto';
import { createStore } from '@stencil/store';
import { data as arrivalsMockData } from '@/components/ir-arrivals/_data';

export interface DeparturesPagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface DeparturesStore {
  bookings: Booking[];
  filteredBookings: Booking[];
  paginatedBookings: Booking[];
  needsCheckOutBookings: Booking[];
  outBookings: Booking[];
  searchTerm: string;
  pagination: DeparturesPagination;
  today: string;
}

const initialState: DeparturesStore = {
  bookings: [],
  filteredBookings: [],
  paginatedBookings: [],
  needsCheckOutBookings: [],
  outBookings: [],
  searchTerm: '',
  pagination: {
    page: 1,
    pageSize: 20,
    total: 0,
    totalPages: 1,
  },
  today: getTodayString(),
};

export const { state: departuresStore, onChange: onDeparturesStoreChange } = createStore<DeparturesStore>(initialState);

export function initializeDeparturesStore(bookings: Booking[] = arrivalsMockData as any[]) {
  departuresStore.bookings = Array.isArray(bookings) ? [...bookings] : [];
  runDeparturesPipeline();
}

export function setDeparturesSearchTerm(term: string) {
  departuresStore.searchTerm = term ?? '';
  runDeparturesPipeline();
}

export function setDeparturesPage(page: number) {
  const safePage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
  departuresStore.pagination = { ...departuresStore.pagination, page: safePage };
  runDeparturesPipeline();
}

export function setDeparturesPageSize(pageSize: number) {
  if (!Number.isFinite(pageSize) || pageSize <= 0) {
    return;
  }
  departuresStore.pagination = { ...departuresStore.pagination, pageSize: Math.floor(pageSize), page: 1 };
  runDeparturesPipeline();
}

export function setDeparturesReferenceDate(date: string | Date) {
  departuresStore.today = formatDateInput(date ?? new Date());
  runDeparturesPipeline();
}

function runDeparturesPipeline() {
  const bookingsForToday = getBookingsForDate(departuresStore.bookings, departuresStore.today);
  const searchedBookings = filterBookingsBySearch(bookingsForToday, departuresStore.searchTerm);

  const total = searchedBookings.length;
  const { pageSize } = departuresStore.pagination;
  const totalPages = total === 0 ? 1 : Math.ceil(total / pageSize);
  const safePage = clamp(departuresStore.pagination.page, 1, totalPages);
  const start = (safePage - 1) * pageSize;
  const paginated = searchedBookings.slice(start, start + pageSize);

  departuresStore.filteredBookings = searchedBookings;
  departuresStore.pagination = { ...departuresStore.pagination, total, totalPages, page: safePage };
  departuresStore.paginatedBookings = paginated;

  const split = splitBookingsByStatus(paginated);
  departuresStore.needsCheckOutBookings = split.needsCheckOut;
  departuresStore.outBookings = split.out;
}

function getBookingsForDate(bookings: Booking[], date: string) {
  if (!date) {
    return [];
  }
  return bookings
    .map(booking => {
      const roomsForToday = (booking.rooms ?? []).filter(room => normalizeDate(room.to_date) === date);
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
      const needsCheckoutRooms = rooms.filter(room => isNeedsCheckOut(room));
      if (needsCheckoutRooms.length) {
        acc.needsCheckOut.push({ ...booking, rooms: needsCheckoutRooms });
      }
      const isOutRooms = rooms.filter(room => isOut(room));
      if (isOutRooms.length) {
        acc.out.push({ ...booking, rooms: isOutRooms });
      }
      return acc;
    },
    { needsCheckOut: [] as Booking[], out: [] as Booking[] },
  );
}

function isNeedsCheckOut(room: Room) {
  const code = room.in_out?.code ?? '';
  return code === '001';
}

function isOut(room: Room) {
  return room.in_out?.code === '002';
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

initializeDeparturesStore();
