import { Booking, Guest } from '@/models/booking.dto';
import { ICountry, ISetupEntries } from '@/models/IBooking';
import { BookingSource, TEventType } from '@/models/igl-book-property';
import { BeddingSetup, ISmokingOption, RatePlan, RoomType, Variation } from '@/models/property';
import { calculateDaysBetweenDates } from '@/utils/booking';
import { createStore } from '@stencil/store';
import moment, { Moment } from 'moment';

// -----------------------------------------------------------------------------
// Type Definitions
// -----------------------------------------------------------------------------

/**
 * Shape of a single rate plan selection for a specific room type.
 */
export interface IRatePlanSelection {
  reserved: number;
  visibleInventory: number;
  selected_variation: Variation | null;
  ratePlan: RatePlan;
  guest: RatePlanGuest[] | null;
  guestName: string[];
  is_bed_configuration_enabled: boolean;
  checkoutVariations: Variation[];
  checkoutBedSelection: string[];
  is_amount_modified?: boolean;
  view_mode: '002' | '001';
  rp_amount: number;
  checkoutSmokingSelection: string[];
  roomtype: {
    id: number;
    name: string;
    physicalrooms: null;
    rateplans: null;
    availabilities: null;
    inventory: number;
    rate: number;
    smoking_option: ISmokingOption;
    bedding_setup: BeddingSetup[];
    is_bed_configuration_enabled: boolean;
  };
}
export interface RatePlanGuest {
  first_name: string;
  last_name: string;
  unit: string | null;
  bed_preference: string | null;
  infant_nbr: number | null;
  roomtype_id?: number;
}

export interface IRoomTypeSelection {
  [ratePlanId: number]: IRatePlanSelection;
}
export interface ISelectedVariation {
  variation: Variation;
  state: 'default' | 'modified';
}
export interface IBookinAvailabilityParams {
  from_date: Date | null;
  to_date: Date | null;
  adult_nbr: number;
  child_nbr: number;
  infant_nbr: number;
  coupon?: string;
  agent?: number;
  loyalty?: boolean;
  agent_code?: string;
}

/**
 * Temporary booking info captured across the booking wizard.
 */
export interface BookingDraft {
  dates: {
    checkIn: Moment;
    checkOut: Moment;
  };
  occupancy: {
    adults: number;
    children: number;
  };
  source: BookingSource;
  guest?: any;
}

/**
 * Lookup datasets used by dropdowns across the booking experience.
 */
export interface BookingSelects {
  sources: BookingSource[];
  ratePricingMode: ISetupEntries['ratePricingMode'];
  arrivalTime: ISetupEntries['arrivalTime'];
  bedPreferences: ISetupEntries['bedPreferenceType'];
  countries: ICountry[];
}

/**
 * Snapshot of the guest that pays for or books the reservation.
 */
export interface BookedByGuest {
  id: number | null;
  email: string;
  firstName: string;
  lastName: string;
  countryId: string;
  phone_prefix: string;
  mobile: string;
  selectedArrivalTime: string;
  emailGuest: boolean;
  note: string;
  cardNumber: string;
  cardHolderName: string;
  expiryMonth: string;
  expiryYear: string;
}
/**
 * Root state shared across the booking experience.
 */
export interface BookingStore {
  tax_statement: { message: string } | null;
  checkout_guest: Guest | null;
  selectedPaymentMethod: { code: string };
  roomTypes: RoomType[];
  enableBooking: boolean;
  ratePlanSelections: { [roomTypeId: number]: IRoomTypeSelection };
  event_type: { type: TEventType };
  guest: RatePlanGuest;
  bookingAvailabilityParams: IBookinAvailabilityParams;
  booking: Booking;
  resetBooking: boolean;
  isInFreeCancelationZone: boolean;
  fictus_booking_nbr: { nbr: string | null };
  bookingDraft: BookingDraft;
  selects: BookingSelects;
  bookedByGuest: BookedByGuest;
  bookedByGuestManuallyEdited: boolean;
}

export interface ReservedRoomSelection {
  roomTypeId: number;
  ratePlanId: number;
  reservationIndex: number;
  guest: RatePlanGuest | null;
  ratePlanSelection: IRatePlanSelection;
}
export const bookedByGuestBaseData = {
  id: -1,
  email: '',
  firstName: '',
  lastName: '',
  countryId: '',
  phone_prefix: '',
  mobile: '',
  selectedArrivalTime: '',
  emailGuest: false,
  note: '',
  cardNumber: '',
  cardHolderName: '',
  expiryMonth: '',
  expiryYear: '',
};

// -----------------------------------------------------------------------------
// Store Initialization
// -----------------------------------------------------------------------------
const initialState: BookingStore = {
  bookedByGuest: bookedByGuestBaseData,
  bookedByGuestManuallyEdited: false,
  bookingDraft: {
    dates: {
      checkIn: moment().startOf('day'),
      checkOut: moment().add(1, 'day'),
    },
    occupancy: {
      adults: null,
      children: null,
    },
    source: null,
  },
  selects: {
    sources: [],
    ratePricingMode: [],
    arrivalTime: [],
    bedPreferences: [],
    countries: [],
  },
  checkout_guest: null,
  guest: null,
  tax_statement: null,
  roomTypes: [],
  enableBooking: false,
  resetBooking: false,
  ratePlanSelections: {},
  selectedPaymentMethod: null,
  isInFreeCancelationZone: false,
  bookingAvailabilityParams: {
    from_date: null,
    to_date: null,
    adult_nbr: 0,
    child_nbr: 0,
    infant_nbr: 0,
  },
  booking: null,
  fictus_booking_nbr: null,
  event_type: { type: 'PLUS_BOOKING' },
};

export let { state: booking_store, onChange: onRoomTypeChange, reset } = createStore<BookingStore>(initialState);

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

/**
 * Clears the booking store. Optionally rehydrates dropdowns and guest info when keeping the modal open.
 */
export function resetBookingStore(closeModal: boolean) {
  const { bookingDraft, selects, bookedByGuest } = booking_store;
  reset();
  if (!closeModal) {
    setBookingDraft(bookingDraft);
    updateBookedByGuest(bookedByGuest);
    setBookingSelectOptions(selects);
  }
}
/**
 * Convenience helper that resets shared state while keeping the modal visible.
 */
export function resetAvailability(): void {
  resetBookingStore(false);
}

/**
 * Updates booking draft pieces (dates, occupancy, source) while keeping unrelated keys intact.
 */
export function setBookingDraft(params: Partial<BookingDraft>) {
  booking_store.bookingDraft = {
    ...booking_store.bookingDraft,
    ...params,
    dates: {
      ...booking_store.bookingDraft.dates,
      ...params.dates,
    },
    occupancy: {
      ...booking_store.bookingDraft.occupancy,
      ...params.occupancy,
    },
  };
}
/**
 * Updates dropdown lookup datasets (sources, bed preferences, etc.).
 */
export function setBookingSelectOptions(params: Partial<BookingSelects>) {
  booking_store.selects = {
    ...booking_store.selects,
    ...params,
  };
}
/**
 * Ensures the selected variation still exists on the server payload.
 */
function resolveSelectedVariation(variations: Variation[], selected_variation: Variation): Variation {
  if (!variations) {
    return null;
  }
  if (!selected_variation || booking_store.resetBooking) {
    return variations[0];
  }
  return variations?.find(v => v.adult_nbr === selected_variation.adult_nbr && v.child_nbr === selected_variation.child_nbr) ?? null;
}

/**
 * Keeps `ratePlanSelections` in sync when backend refreshes available room types.
 */
onRoomTypeChange('roomTypes', (newValue: RoomType[]) => {
  const currentSelections = booking_store.ratePlanSelections;
  const ratePlanSelections: { [roomTypeId: number]: IRoomTypeSelection } = {};
  newValue.forEach(roomType => {
    if (!roomType.is_active) return;
    ratePlanSelections[roomType.id] = ratePlanSelections[roomType.id] || {};

    roomType.rateplans.forEach(ratePlan => {
      if (!ratePlan.is_active || !ratePlan?.variations?.length) return;
      let lastVariation = ratePlan.variations[ratePlan.variations.length - 1];
      lastVariation = ratePlan.selected_variation ?? lastVariation;
      const currentRatePlanSelection = currentSelections[roomType.id]?.[ratePlan.id];
      ratePlanSelections[roomType.id][ratePlan.id] =
        currentRatePlanSelection && Object.keys(currentRatePlanSelection).length > 0
          ? {
              ...currentRatePlanSelection,
              ratePlan,
              selected_variation: resolveSelectedVariation(ratePlan.variations, currentRatePlanSelection.selected_variation) ?? null,
              visibleInventory: roomType.inventory,
              reserved: roomType.inventory === 0 ? 0 : booking_store.resetBooking ? 0 : currentRatePlanSelection.reserved,
              checkoutVariations: roomType.inventory === 0 ? [] : currentRatePlanSelection.checkoutVariations,
              checkoutBedSelection: roomType.inventory === 0 ? [] : currentRatePlanSelection.checkoutBedSelection,
              checkoutSmokingSelection: roomType.inventory === 0 ? [] : currentRatePlanSelection.checkoutSmokingSelection,
              guestName: roomType.inventory === 0 ? [] : currentRatePlanSelection.guestName,
              roomtype: {
                ...currentRatePlanSelection.roomtype,
              },
            }
          : {
              reserved: 0,
              rp_amount: 0,
              view_mode: '001',
              guest: null,
              visibleInventory: roomType.inventory,
              selected_variation: ratePlan?.variations[0] ?? null,
              ratePlan,
              guestName: [],
              is_bed_configuration_enabled: roomType.is_bed_configuration_enabled,
              roomtype: {
                ...roomType,
                physicalrooms: null,
                rateplans: null,
                availabilities: null,
              },
              checkoutVariations: [],
              checkoutBedSelection: [],
              checkoutSmokingSelection: [],
            };
    });
  });
  booking_store.ratePlanSelections = ratePlanSelections;
  booking_store.resetBooking = false;
});

// -----------------------------------------------------------------------------
// State Mutators
// -----------------------------------------------------------------------------
/**
 * Partially updates the booked-by guest snapshot, preserving other properties.
 */
export function updateBookedByGuest(params: Partial<BookedByGuest>) {
  booking_store.bookedByGuest = {
    ...booking_store.bookedByGuest,
    ...params,
  };
}
/**
 * Updates the guest list assigned to a specific rate plan selection.
 */
export function updateRoomGuest({
  guest,
  ratePlanId,
  roomTypeId,
  ratePlanSelection,
}: {
  roomTypeId: number;
  ratePlanId: number;
  guest: IRatePlanSelection['guest'];
  ratePlanSelection: IRatePlanSelection;
}) {
  booking_store.ratePlanSelections = {
    ...booking_store.ratePlanSelections,
    [roomTypeId]: {
      ...booking_store.ratePlanSelections[roomTypeId],
      [ratePlanId]: { ...ratePlanSelection, guest: [...guest] },
    },
  };
}
/**
 * Recomputes remaining visible inventory for a room type whenever selections change.
 */
export function updateInventory(roomTypeId: number) {
  const roomTypeSelection = booking_store.ratePlanSelections[roomTypeId];
  if (!roomTypeSelection) {
    return;
  }
  const roomTypeData = booking_store.roomTypes.find(rt => rt.id === roomTypeId);
  if (!roomTypeData) {
    return;
  }
  const totalReserved = Object.values(roomTypeSelection).reduce((acc, ratePlan) => acc + ratePlan.reserved, 0);
  let hasChanges = false;

  const newRatePlans = Object.entries(roomTypeSelection).reduce((acc, [ratePlanId, ratePlan]) => {
    const roomsExcludingCurrent = totalReserved - ratePlan.reserved;
    const availableRooms = Math.max(roomTypeData.inventory - roomsExcludingCurrent, 0);
    if (ratePlan.visibleInventory !== availableRooms) {
      hasChanges = true;
      acc[ratePlanId] = { ...ratePlan, visibleInventory: availableRooms };
    } else {
      acc[ratePlanId] = ratePlan;
    }
    return acc;
  }, {} as IRoomTypeSelection);

  if (hasChanges) {
    booking_store.ratePlanSelections = {
      ...booking_store.ratePlanSelections,
      [roomTypeId]: newRatePlans,
    };
  }
}
/**
 * Returns true when any room type currently has at least one reservation selected.
 */
export function hasAtLeastOneRoomSelected(): boolean {
  return Object.values(booking_store.ratePlanSelections).some(roomTypeSelection => Object.values(roomTypeSelection).some(ratePlan => ratePlan.reserved > 0));
}
/**
 * Applies a patch of values to the given room type & rate plan combination.
 */
export function updateRoomParams({ ratePlanId, roomTypeId, params }: { roomTypeId: number; ratePlanId: number; params: Partial<IRatePlanSelection> }) {
  booking_store.ratePlanSelections = {
    ...booking_store.ratePlanSelections,
    [Number(roomTypeId)]: {
      ...booking_store.ratePlanSelections[Number(roomTypeId)],
      [ratePlanId]: {
        ...booking_store.ratePlanSelections[roomTypeId][ratePlanId],
        ...params,
      },
    },
  };
}

/**
 * Reserves a number of rooms for a rate plan and bootstraps its selection entry if needed.
 */
export function reserveRooms({ ratePlanId, roomTypeId, rooms, guest }: { roomTypeId: number; ratePlanId: number; rooms: number; guest?: RatePlanGuest[] }) {
  if (!booking_store.ratePlanSelections[roomTypeId]) {
    booking_store.ratePlanSelections[roomTypeId] = {};
  }
  const roomType = booking_store.roomTypes?.find(r => r.id === roomTypeId);
  if (!roomType) {
    throw new Error('Invalid room type id');
  }
  const ratePlan = roomType.rateplans.find(r => r.id === ratePlanId);
  if (!ratePlan) {
    throw new Error('Invalid rate plan');
  }
  let newGuest = Array.from({ length: rooms }, () => ({ first_name: '', last_name: '', unit: null, bed_preference: null, infant_nbr: null }));
  if (guest) {
    newGuest = guest;
  }
  if (!booking_store.ratePlanSelections[roomTypeId][ratePlanId]) {
    booking_store.ratePlanSelections[roomTypeId][ratePlanId] = {
      guestName: [],
      reserved: 0,
      view_mode: '001',
      rp_amount: 0,
      guest: newGuest,
      is_bed_configuration_enabled: roomType.is_bed_configuration_enabled,
      visibleInventory: 0,
      selected_variation: null,
      ratePlan,
      checkoutVariations: [],
      checkoutBedSelection: [],
      checkoutSmokingSelection: [],
      roomtype: {
        id: roomType.id,
        name: roomType.name,
        physicalrooms: null,
        rateplans: null,
        availabilities: null,
        inventory: roomType.inventory,
        rate: roomType.rate,
        bedding_setup: roomType.bedding_setup,
        smoking_option: roomType.smoking_option,
        is_bed_configuration_enabled: roomType.is_bed_configuration_enabled,
      },
    };
  }

  booking_store.ratePlanSelections = {
    ...booking_store.ratePlanSelections,
    [Number(roomTypeId)]: {
      ...booking_store.ratePlanSelections[Number(roomTypeId)],
      [ratePlanId]: {
        ...booking_store.ratePlanSelections[roomTypeId][ratePlanId],
        reserved: rooms,
        checkoutVariations: [],
        guest: newGuest,
      },
    },
  };
  updateInventory(roomTypeId);
}

// -----------------------------------------------------------------------------
// Selectors & Derived Data
// -----------------------------------------------------------------------------
/**
 * Safely retrieves the selection payload for a specific room type/rate plan pair.
 */
export function getVisibleInventory(roomTypeId: number, ratePlanId: number): IRatePlanSelection {
  if (!booking_store.ratePlanSelections || !booking_store.ratePlanSelections[roomTypeId]) {
    return {
      reserved: 0,
      guest: null,
      visibleInventory: 0,
      selected_variation: null,
      ratePlan: null,
      guestName: [],
      is_bed_configuration_enabled: false,
      checkoutVariations: [],
      checkoutBedSelection: [],
      checkoutSmokingSelection: [],
      rp_amount: 0,
      view_mode: '001',
      roomtype: null,
    };
  }
  return booking_store.ratePlanSelections[roomTypeId][ratePlanId];
}

/**
 * Generic setter for store keys when more specific helpers are unnecessary.
 */
export function modifyBookingStore(key: keyof BookingStore, value: any) {
  booking_store[key] = value;
}

// -----------------------------------------------------------------------------
// Pricing & Validation
// -----------------------------------------------------------------------------
/**
 * Computes total and prepayment amounts with an option to force gross calculation.
 */
export function calculateTotalCost(gross: boolean = false): { totalAmount: number; prePaymentAmount: number } {
  let prePaymentAmount = 0;
  let totalAmount = 0;
  const calculateCost = (ratePlan: IRatePlanSelection, isPrePayment: boolean = false) => {
    if (ratePlan.checkoutVariations.length > 0 && ratePlan.reserved > 0) {
      if (isPrePayment) {
        return ratePlan.reserved * ratePlan.ratePlan.pre_payment_amount || 0;
      }
      return ratePlan.checkoutVariations.reduce((sum, variation) => {
        return sum + Number(variation[gross ? 'discounted_gross_amount' : 'discounted_amount']);
      }, 0);
    } else if (ratePlan.reserved > 0) {
      const amount = isPrePayment ? ratePlan.ratePlan.pre_payment_amount ?? 0 : ratePlan.selected_variation[gross ? 'discounted_gross_amount' : 'discounted_amount'];
      return ratePlan.reserved * (amount ?? 0);
    }
    return 0;
  };
  Object.values(booking_store.ratePlanSelections).forEach(value => {
    Object.values(value).forEach(ratePlan => {
      totalAmount += calculateCost(ratePlan);
      prePaymentAmount += calculateCost(ratePlan, true);
    });
  });
  return { totalAmount, prePaymentAmount };
}

/**
 * Returns the amount displayed for a rate plan, honoring overrides and nightly view.
 */
function getRatePlanDisplayAmount(rateplanSelection: IRatePlanSelection, totalNights: number) {
  if (rateplanSelection.is_amount_modified) {
    return rateplanSelection.view_mode === '001' ? rateplanSelection.rp_amount : rateplanSelection.rp_amount * totalNights;
  }
  return rateplanSelection.selected_variation?.discounted_gross_amount ?? 0;
}
/**
 * Aggregates the total booking price combining all selected rate plans.
 */
export function getBookingTotalPrice(): number {
  const dateDiff = calculateDaysBetweenDates(booking_store.bookingDraft.dates.checkIn.format('YYYY-MM-DD'), booking_store.bookingDraft.dates.checkOut.format('YYYY-MM-DD'));

  let totalPrice = 0;

  Object.values(booking_store.ratePlanSelections).forEach(roomTypeSelection => {
    Object.values(roomTypeSelection).forEach(ratePlan => {
      if (ratePlan.reserved === 0) {
        return;
      }
      const rateAmount = getRatePlanDisplayAmount(ratePlan, dateDiff);
      totalPrice += rateAmount;
    });
  });

  return totalPrice;
}
/**
 * Validates that every reserved guest entry contains a non-empty name.
 */
export function validateBooking() {
  return Object.values(booking_store.ratePlanSelections).every(roomTypeSelection =>
    Object.values(roomTypeSelection).every(ratePlan => ratePlan.guestName.every(name => name.trim() !== '')),
  );
}
/**
 * Counts the number of reserved rooms across all rate plans.
 */
export function calculateTotalRooms() {
  return Object.values(booking_store.ratePlanSelections).reduce((total, value) => {
    return (
      total +
      Object.values(value).reduce((innerTotal, ratePlan) => {
        if (ratePlan.reserved === 0) {
          return innerTotal;
        }
        return innerTotal + ratePlan.reserved;
      }, 0)
    );
  }, 0);
}

/**
 * Clears all reserved rooms and resets per-rate-plan metadata.
 */
export function resetReserved(): void {
  const updatedSelections = Object.entries(booking_store.ratePlanSelections).reduce((acc, [roomTypeId, ratePlans]) => {
    const roomType = booking_store.roomTypes.find(rt => rt.id.toString() === roomTypeId.toString());
    acc[roomTypeId] = Object.entries(ratePlans).reduce((rpAcc, [ratePlanId, ratePlan]) => {
      const initialInventory = roomType?.inventory ?? ratePlan.roomtype?.inventory ?? ratePlan.visibleInventory;
      rpAcc[ratePlanId] = {
        ...ratePlan,
        reserved: 0,
        guest: null,
        guestName: [],
        checkoutVariations: [],
        checkoutBedSelection: [],
        checkoutSmokingSelection: [],
        visibleInventory: initialInventory ?? 0,
      };
      return rpAcc;
    }, {} as any);
    return acc;
  }, {} as any);
  booking_store.ratePlanSelections = { ...updatedSelections };
}

/**
 * Flags whether the booked-by guest fields were manually edited (for UX hints elsewhere).
 */
export function setBookedByGuestManualEditState(isEdited: boolean) {
  booking_store.bookedByGuestManuallyEdited = isEdited;
}

/**
 * Returns a flat array of each reserved room along with its guest/context.
 */
export function getReservedRooms(): ReservedRoomSelection[] {
  const reservedRooms: ReservedRoomSelection[] = [];
  Object.entries(booking_store.ratePlanSelections).forEach(([roomTypeId, ratePlans]) => {
    Object.entries(ratePlans).forEach(([ratePlanId, ratePlanSelection]) => {
      if (!ratePlanSelection.reserved) {
        return;
      }
      const guests = ratePlanSelection.guest ?? [];
      for (let reservationIndex = 0; reservationIndex < ratePlanSelection.reserved; reservationIndex++) {
        reservedRooms.push({
          roomTypeId: Number(roomTypeId),
          ratePlanId: Number(ratePlanId),
          reservationIndex,
          guest: guests[reservationIndex] ?? null,
          ratePlanSelection,
        });
      }
    });
  });
  return reservedRooms;
}

export default booking_store;
