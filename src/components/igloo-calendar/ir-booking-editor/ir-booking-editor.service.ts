import { Booking, Room } from '@/models/booking.dto';
import VariationService from '@/services/variation.service';
import booking_store, { IRatePlanSelection, modifyBookingStore, reserveRooms } from '@/stores/booking.store';
import { extras } from '@/utils/utils';
import moment, { Moment } from 'moment';
import { BookingEditorMode } from './types';
import calendar_data from '@/stores/calendar-data';

export class IRBookingEditorService {
  /** Current booking editor mode */
  private mode: BookingEditorMode;

  /** Lazy-initialized variation service */
  private variationService?: VariationService;

  constructor(mode?: BookingEditorMode) {
    this.mode = mode;
  }
  public setMode(mode: BookingEditorMode) {
    this.mode = mode;
  }

  /**
   * Syncs room data with the booking store and reserves a room.
   * Aborts if required room data is missing.
   */
  public updateBooking(room?: Room): void {
    if (!room) return;

    try {
      const roomtypeId = room.roomtype?.id;
      const rateplanId = room.rateplan?.id;
      const guestData = room.guest;
      const occupancy = room.occupancy;

      if (!roomtypeId || !rateplanId || !guestData || !occupancy) {
        console.warn('[updateBooking] Missing required room data', room);
        return;
      }

      const guest = {
        bed_preference: room.bed_preference?.toString() ?? null,
        infant_nbr: occupancy.infant_nbr ?? 0,
        last_name: guestData.last_name ?? '',
        first_name: guestData.first_name ?? '',
        unit: (room.unit as any)?.id?.toString() ?? null,
        roomtype_id: roomtypeId,
      };

      modifyBookingStore('guest', guest);

      reserveRooms({
        roomTypeId: roomtypeId,
        ratePlanId: rateplanId,
        rooms: 1,
        guest: [guest],
      });
    } catch (error) {
      console.error('[updateBooking] Failed', error);
    }
  }

  /**
   * Finds a room by identifier and syncs its guest data to the store.
   */
  public getRoom(booking?: Booking, identifier?: string): Room | undefined {
    if (!booking || !identifier) return;

    const room = booking.rooms?.find(r => r.identifier === identifier);
    if (!room) return;

    modifyBookingStore('guest', {
      bed_preference: room.bed_preference?.toString() ?? null,
      infant_nbr: room.occupancy?.infant_nbr ?? 0,
      first_name: room.guest?.first_name ?? '',
      last_name: room.guest?.last_name ?? '',
      unit: (room.unit as any)?.id?.toString() ?? null,
    });

    return room;
  }

  // ─────────────────────────────────────────────
  // Utility helpers
  // ─────────────────────────────────────────────

  /**
   * Checks whether a string contains underscores.
   * Used to validate phone numbers.
   */
  private hasUnderscore(str: string): boolean {
    return /_+/.test(str);
  }
  /**
   * Generates daily rate entries for a reserved room.
   */
  private calculateAmount({ is_amount_modified, selected_variation, view_mode, rp_amount }: IRatePlanSelection) {
    const total_days = selected_variation.nights.length;
    if (is_amount_modified) {
      return view_mode === '002' ? rp_amount : rp_amount / total_days;
    }
  }
  /**
   * Builds room payloads based on selected rate plans
   * and booking draft context.
   */
  private generateDailyRates(rate_plan: IRatePlanSelection, i: number) {
    let variation = rate_plan.selected_variation;
    const amount = rate_plan.is_amount_modified ? this.calculateAmount(rate_plan) : null;
    if (rate_plan.guest[i].infant_nbr > 0 && !rate_plan.is_amount_modified) {
      if (!this.variationService) {
        this.variationService = new VariationService();
      }
      variation = this.variationService.getVariationBasedOnInfants({
        variations: rate_plan.ratePlan.variations,
        baseVariation: rate_plan.selected_variation,
        infants: rate_plan.guest[i].infant_nbr,
      });
    }
    return variation.nights.map(n => ({
      date: n.night,
      amount: amount ?? n.discounted_amount,
      cost: null,
    }));
  }

  private getBookedRooms({
    check_in,
    check_out,
    notes,
    identifier,
    override_unit,
    unit,
    auto_check_in,
  }: {
    identifier: string | null;
    check_in: Moment;
    check_out: Moment;
    override_unit: boolean;
    unit: string;
    notes: string | null;
    auto_check_in: boolean;
  }) {
    const rooms = [];

    for (const roomTypeId in booking_store.ratePlanSelections) {
      const roomtype = booking_store.ratePlanSelections[roomTypeId];
      for (const rateplanId in roomtype) {
        const rateplan = roomtype[rateplanId];
        if (rateplan.reserved > 0) {
          for (let i = 0; i < rateplan.reserved; i++) {
            const { first_name, last_name } = rateplan.guest[i];
            rooms.push({
              identifier,
              roomtype: rateplan.roomtype,
              rateplan: rateplan.ratePlan,
              prepayment_amount_gross: 0,
              unit: override_unit ? { id: unit } : rateplan.guest[i].unit ? { id: rateplan.guest[i].unit } : null,
              occupancy: {
                adult_nbr: rateplan.selected_variation.adult_nbr,
                children_nbr: Number(rateplan.selected_variation.child_nbr ?? 0) - Math.max(Number(rateplan.guest[i].infant_nbr ?? 0), 0),
                infant_nbr: rateplan.guest[i].infant_nbr,
              },
              bed_preference: rateplan.guest[i].bed_preference,
              from_date: moment(check_in).format('YYYY-MM-DD'),
              to_date: moment(check_out).format('YYYY-MM-DD'),
              notes,
              check_in: auto_check_in,
              days: this.generateDailyRates(rateplan, i),
              guest: {
                email: null,
                first_name,
                last_name,
                country_id: null,
                city: null,
                mobile: null,
                address: null,
                dob: null,
                subscribe_to_news_letter: null,
                cci: null,
              },
            });
          }
        }
      }
    }
    return rooms;
  }
  public isEventType(mode: BookingEditorMode | BookingEditorMode[]): boolean {
    if (Array.isArray(mode)) {
      return mode.includes(this.mode);
    }
    return this.mode === mode;
  }
  /**
   * Prepares payload parameters for the booking user service
   * based on the current editor mode.
   */
  public async prepareBookUserServiceParams({ check_in, booking, room, unitId }: { check_in: boolean; booking: Booking; room: Room; unitId: string }) {
    try {
      // Validate context structure
      const { dates } = booking_store.bookingDraft;

      const fromDate = dates.checkIn;
      const toDate = dates.checkOut;

      const generateNewRooms = (identifier = null, check_in: boolean = false) => {
        return this.getBookedRooms({
          check_in: fromDate,
          check_out: toDate,
          identifier,
          notes: '',
          override_unit: this.isEventType(['BAR_BOOKING', 'SPLIT_BOOKING']) ? true : false,
          unit: this.isEventType(['BAR_BOOKING', 'SPLIT_BOOKING']) ? unitId?.toString() ?? null : null,
          auto_check_in: check_in,
        });
      };

      const modifyBookingDetails = ({ pickup_info, extra_services, is_direct, is_in_loyalty_mode, promo_key, extras, ...rest }: Booking, rooms: Room[]) => {
        return {
          assign_units: true,
          is_pms: true,
          is_direct,
          is_backend: true,
          is_in_loyalty_mode,
          promo_key,
          extras,
          booking: {
            ...rest,
            rooms,
          },
          extra_services,
          pickup_info,
        };
      };

      let newBooking = null;
      const sourceOption = booking_store.bookingDraft.source;
      switch (this.mode) {
        case 'EDIT_BOOKING': {
          const filteredRooms = booking.rooms.filter(r => r.identifier !== room.identifier);
          const newRooms = generateNewRooms(room.identifier, room.in_out?.code === '001');
          newBooking = modifyBookingDetails(booking, [...filteredRooms, ...newRooms]);
          break;
        }
        case 'ADD_ROOM':
        case 'SPLIT_BOOKING': {
          const newRooms = generateNewRooms();
          const previousRooms = booking.rooms;
          newBooking = modifyBookingDetails(booking, [...previousRooms, ...newRooms]);
          break;
        }
        default: {
          const newRooms = generateNewRooms(null, check_in);
          const { bookedByGuest } = booking_store;
          const isAgent = sourceOption.type === 'TRAVEL_AGENCY';
          newBooking = {
            assign_units: true,
            is_pms: true,
            is_direct: true,
            is_backend: true,
            is_in_loyalty_mode: false,
            promo_key: null,
            extras: [...extras.filter(e => e.key !== 'payment_code'), { key: 'payment_code', value: booking_store.selectedPaymentMethod?.code }],
            agent: isAgent ? { id: sourceOption.tag } : null,
            booking: {
              from_date: moment(fromDate).format('YYYY-MM-DD'),
              to_date: moment(toDate).format('YYYY-MM-DD'),
              remark: bookedByGuest.note || null,
              booking_nbr: '',
              property: {
                id: calendar_data.property.id,
              },
              booked_on: {
                date: moment().format('YYYY-MM-DD'),
                hour: new Date().getHours(),
                minute: new Date().getMinutes(),
              },
              source: isAgent ? '' : sourceOption,
              rooms: newRooms,
              currency: calendar_data.property.currency,
              arrival: { code: bookedByGuest.selectedArrivalTime },
              guest: {
                email: bookedByGuest.email === '' ? null : bookedByGuest.email || null,
                first_name: bookedByGuest.firstName,
                last_name: bookedByGuest.lastName,
                country_id: bookedByGuest.countryId === '' ? null : bookedByGuest.countryId,
                city: null,
                mobile: bookedByGuest.mobile === null ? '' : this.hasUnderscore(bookedByGuest.mobile) ? '' : bookedByGuest.mobile,
                country_phone_prefix: bookedByGuest?.phone_prefix ?? null,
                address: '',
                dob: null,
                subscribe_to_news_letter: bookedByGuest.emailGuest || false,
                cci: bookedByGuest.cardNumber
                  ? {
                      nbr: bookedByGuest.cardNumber,
                      holder_name: bookedByGuest.cardHolderName,
                      expiry_month: bookedByGuest.expiryMonth,
                      expiry_year: bookedByGuest.expiryYear,
                    }
                  : null,
              },
            },
            pickup_info: null,
          };
          break;
        }
      }
      return newBooking;
    } catch (error) {
      console.error(error);
    }
  }
}
