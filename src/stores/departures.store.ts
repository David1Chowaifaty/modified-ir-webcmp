import { PaginationRange } from '@/components/ir-pagination/ir-pagination';
import { Booking, Room } from '@/models/booking.dto';
import { canCheckout } from '@/utils/utils';
import { createStore } from '@stencil/store';
import moment from 'moment';

export interface DeparturesPagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  currentPage: number;
  showing: PaginationRange;
}

export interface DeparturesStore {
  bookings: Booking[];
  filteredBookings: Booking[];
  paginatedBookings: Booking[];
  needsCheckOutBookings: Booking[];
  futureRooms: Booking[];
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
  futureRooms: [],
  outBookings: [],
  searchTerm: '',
  pagination: {
    page: 1,
    pageSize: 20,
    total: 0,
    totalPages: 1,
    currentPage: 1,
    showing: { from: 0, to: 0 },
  },
  today: getTodayString(),
};

export const { state: departuresStore, onChange: onDeparturesStoreChange } = createStore<DeparturesStore>(initialState);

export function initializeDeparturesStore(bookings: Booking[] = []) {
  departuresStore.bookings = Array.isArray(bookings) ? [...bookings] : [];
  runDeparturesPipeline();
}

export function setDepartureTotal(total: number) {
  const normalizedTotal = Number.isFinite(total) && total > 0 ? Math.floor(total) : 0;
  const totalPages = calculateTotalPages(normalizedTotal, departuresStore.pagination.pageSize);
  const safePage = clampPage(departuresStore.pagination.currentPage, Math.max(totalPages, 1));
  departuresStore.pagination = {
    ...departuresStore.pagination,
    total: normalizedTotal,
    totalPages: Math.max(totalPages, 1),
    currentPage: safePage,
    showing: calculateShowing(safePage, departuresStore.pagination.pageSize, normalizedTotal),
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
export function setDeparturesSearchTerm(term: string) {
  departuresStore.searchTerm = term ?? '';
  runDeparturesPipeline();
}

export function setDeparturesPage(page: number) {
  const safePage = clampPage(page, Math.max(departuresStore.pagination.totalPages, 1));
  departuresStore.pagination = {
    ...departuresStore.pagination,
    currentPage: safePage,
    showing: calculateShowing(safePage, departuresStore.pagination.pageSize, departuresStore.pagination.total),
  };
  runDeparturesPipeline();
}

export function setDeparturesPageSize(pageSize: number) {
  if (!Number.isFinite(pageSize) || pageSize <= 0) {
    return;
  }
  const normalizedPageSize = Math.floor(pageSize);
  departuresStore.pagination = {
    ...departuresStore.pagination,
    pageSize: normalizedPageSize,
    currentPage: 1,
    showing: calculateShowing(1, normalizedPageSize, departuresStore.pagination.total),
  };
  runDeparturesPipeline();
}

export function setDeparturesReferenceDate(date: string | Date) {
  departuresStore.today = moment(date, 'YYYY-MM-DD').format('YYYY-MM-DD');
  runDeparturesPipeline();
}

function runDeparturesPipeline() {
  const searchedBookings = filterBookingsBySearch(departuresStore.searchTerm);
  departuresStore.filteredBookings = searchedBookings;
  departuresStore.paginatedBookings = searchedBookings;

  const split = splitBookingsByStatus(searchedBookings);
  departuresStore.needsCheckOutBookings = split.needsCheckOut;
  departuresStore.outBookings = split.out;
  departuresStore.futureRooms = split.futureRooms;
}

function filterBookingsBySearch(term: string) {
  const bookings = departuresStore.bookings;
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
      const futureRooms = rooms.filter(room => isFuture(room));
      if (futureRooms.length) {
        acc.out.push({ ...booking, rooms: futureRooms });
      }
      return acc;
    },
    { needsCheckOut: [] as Booking[], out: [] as Booking[], futureRooms: [] as Booking[] },
  );
}

function isNeedsCheckOut(room: Room) {
  return canCheckout({ to_date: room.to_date, inOutCode: room.in_out.code });
}

function isOut(room: Room) {
  return room.in_out?.code === '002';
}
function isFuture(room: Room) {
  return moment().isBefore(moment(room.to_date, 'YYYY-MM-DD'), 'date');
}

function buildName(person?: { first_name?: string | null; last_name?: string | null } | null) {
  const full = `${person?.first_name ?? ''} ${person?.last_name ?? ''}`.trim();
  return full.toLowerCase();
}

function getTodayString() {
  return moment().format('YYYY-MM-DD');
}

initializeDeparturesStore();
