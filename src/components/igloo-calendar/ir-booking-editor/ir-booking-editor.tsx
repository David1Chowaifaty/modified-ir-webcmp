import { Booking } from '@/models/booking.dto';
import { Component, Event, EventEmitter, Fragment, Host, Listen, Prop, State, Watch, h } from '@stencil/core';
import { BlockedDatePayload, BookedByGuestSchema, BookingEditorMode, BookingStep, RoomsGuestsSchema } from './types';
import { RoomService } from '@/services/room.service';
import { BookingService } from '@/services/booking-service/booking.service';
import locales from '@/stores/locales.store';
import booking_store, {
  BookingDraft,
  getReservedRooms,
  modifyBookingStore,
  reserveRooms,
  resetBookingStore,
  setBookingDraft,
  setBookingSelectOptions,
  updateBookedByGuest,
} from '@/stores/booking.store';
import { BookingSource } from '@/models/igl-book-property';
import calendar_data from '@/stores/calendar-data';
import { ISetupEntries } from '@/models/IBooking';
import moment from 'moment';
import { IRBookingEditorService } from './ir-booking-editor.service';

@Component({
  tag: 'ir-booking-editor',
  styleUrl: 'ir-booking-editor.css',
  scoped: true,
})
export class IrBookingEditor {
  @Prop() propertyId: string | number;
  @Prop() language: string = 'en';
  @Prop() roomTypeIds: (string | number)[] = [];
  @Prop() identifier: string;
  @Prop({ mutable: true }) booking: Booking;
  @Prop() mode: BookingEditorMode = 'PLUS_BOOKING';
  @Prop() checkIn: string;
  @Prop() checkOut: string;
  @Prop() step: BookingStep;
  @Prop() blockedUnit: BlockedDatePayload;
  @Prop() unitId: string;

  @State() isLoading: boolean = true;

  @Event({ composed: true, bubbles: true }) resetBookingEvt: EventEmitter<void>;
  @Event() loadingChanged: EventEmitter<{ cause: string | null }>;
  @Event() adjustBlockedUnit: EventEmitter<any>;

  private roomService = new RoomService();
  private bookingService = new BookingService();
  private bookingEditorService = new IRBookingEditorService(this.mode);

  private room: Booking['rooms'][0];

  private get adjustedCheckout() {
    if (this.bookingEditorService.isEventType('PLUS_BOOKING') && !this.blockedUnit) {
      return undefined;
    }
    return this.checkOut;
  }

  componentWillLoad() {
    this.initializeApp();
  }

  @Watch('mode')
  handleModeChange(newMode: BookingEditorMode, oldMode: BookingEditorMode) {
    if (newMode !== oldMode) {
      this.bookingEditorService.setMode(newMode);
    }
  }

  @Listen('guestSelected')
  handleGuestSelected(e: CustomEvent) {
    this.booking = { ...e.detail };
    updateBookedByGuest({
      firstName: this.booking.guest.first_name,
      lastName: this.booking.guest.last_name,
    });
    const source = booking_store.selects.sources.find(s => s.code === this.booking.source.code);
    setBookingDraft({
      source,
    });
  }

  private async initializeApp() {
    try {
      this.isLoading = true;
      this.bookingEditorService.setMode(this.mode);
      const [languageTexts, countriesList] = await Promise.all([
        this.roomService.fetchLanguage(this.language),
        this.bookingService.getCountries(this.language),
        this.roomService.getExposedProperty({ id: Number(this.propertyId), language: this.language }),
      ]);
      if (!locales.entries) {
        locales.entries = languageTexts.entries;
        locales.direction = languageTexts.direction;
      }
      await this.fetchSetupEntriesAndInitialize();
      setBookingSelectOptions({
        countries: countriesList,
      });
      this.initializeDraftFromBooking();
      if (this.bookingEditorService.isEventType('EDIT_BOOKING')) {
        await this.checkBookingAvailability();
      }
    } catch (error) {
      console.error('Error initializing app:', error);
    } finally {
      this.isLoading = false;
    }
  }

  disconnectedCallback() {
    resetBookingStore(true);
  }

  @Listen('checkAvailability')
  handleCheckAvailability(e: CustomEvent) {
    e.stopImmediatePropagation();
    e.stopPropagation();
    this.checkBookingAvailability();
  }
  /**
   * Initializes booking draft and guest data
   * based on the current editor mode.
   *
   * Throws if required booking data is missing.
   */
  private initializeDraftFromBooking() {
    if (this.bookingEditorService.isEventType(['EDIT_BOOKING', 'ADD_ROOM'])) {
      if (!this.booking || (!this.identifier && this.bookingEditorService.isEventType('EDIT_BOOKING'))) {
        throw new Error('Missing booking or identifier');
      }
    }

    if (this.bookingEditorService.isEventType('EDIT_BOOKING')) {
      const room = this.booking.rooms.find(room => room.identifier === this.identifier);
      modifyBookingStore('guest', {
        bed_preference: room.bed_preference?.toString(),
        infant_nbr: room.occupancy.infant_nbr,
        first_name: room.guest.first_name ?? '',
        last_name: room.guest.last_name ?? '',
        unit: (room.unit as any)?.id?.toString(),
      });
      this.room = room;
    }

    let draft: Partial<BookingDraft> = {
      dates: {
        checkIn: this.checkIn ? moment(this.checkIn, 'YYYY-MM-DD') : moment(),
        checkOut: this.checkOut ? moment(this.checkOut, 'YYYY-MM-DD') : moment().add(1, 'day'),
      },
    };

    if (this.bookingEditorService.isEventType(['EDIT_BOOKING', 'ADD_ROOM'])) {
      const source = booking_store.selects.sources.find(s => s.code === this.booking.source.code);

      draft = {
        ...draft,
        source,
      };

      if (this.bookingEditorService.isEventType('EDIT_BOOKING')) {
        draft = {
          ...draft,
          occupancy: {
            adults: this.booking.occupancy.adult_nbr,
            children: this.booking.occupancy.children_nbr,
          },
        };
      }

      updateBookedByGuest({
        firstName: this.booking.guest.first_name,
        lastName: this.booking.guest.last_name,
      });
    }

    setBookingDraft(draft);
  }
  private updateBooking() {
    try {
      const currentRoomType = this.room;
      const roomtypeId = currentRoomType.roomtype.id;
      const rateplanId = currentRoomType.rateplan.id;
      const guest = {
        bed_preference: currentRoomType.bed_preference?.toString(),
        infant_nbr: currentRoomType.occupancy.infant_nbr,
        last_name: currentRoomType.guest.last_name,
        first_name: currentRoomType.guest.first_name,
        unit: (currentRoomType.unit as any)?.id?.toString(),
        roomtype_id: currentRoomType.roomtype.id,
      };
      modifyBookingStore('guest', guest);
      reserveRooms({
        roomTypeId: roomtypeId,
        ratePlanId: rateplanId,
        rooms: 1,
        guest: [guest],
      });
    } catch (error) {
      console.error(error);
    }
  }
  private async checkBookingAvailability() {
    // resetBookingStore(false);
    const { source, occupancy, dates } = booking_store.bookingDraft;
    const from_date = dates.checkIn.format('YYYY-MM-DD');
    const to_date = dates.checkOut.format('YYYY-MM-DD');
    const is_in_agent_mode = source?.type === 'TRAVEL_AGENCY';
    try {
      const room_type_ids_to_update = this.bookingEditorService.isEventType('EDIT_BOOKING') ? [this.room.roomtype?.id] : [];
      const room_type_ids = this.bookingEditorService.isEventType(['BAR_BOOKING', 'SPLIT_BOOKING']) ? this.roomTypeIds.map(r => Number(r)) : [];

      await this.bookingService.getBookingAvailability({
        from_date,
        to_date,
        propertyid: calendar_data.property.id,
        adultChildCount: {
          adult: occupancy.adults,
          child: occupancy.children,
        },
        language: this.language,
        room_type_ids,
        currency: calendar_data.property.currency,
        agent_id: is_in_agent_mode ? source?.tag : null,
        is_in_agent_mode,
        room_type_ids_to_update,
      });
      if (this.mode !== 'EDIT_BOOKING') {
        await this.assignCountryCode();
      }
      if (this.bookingEditorService.isEventType('EDIT_BOOKING')) {
        this.updateBooking();
      }
    } catch (error) {
      console.error('Error initializing booking availability:', error);
    }
  }

  private async doReservation(source: string) {
    try {
      this.loadingChanged.emit({ cause: source as any });
      const reservedRooms = getReservedRooms();
      RoomsGuestsSchema.parse(reservedRooms.map(r => ({ ...r.guest, requires_bed_preference: r.ratePlanSelection.roomtype.is_bed_configuration_enabled })));
      BookedByGuestSchema.parse(booking_store.bookedByGuest);
      const body = await this.bookingEditorService.prepareBookUserServiceParams({
        check_in: source === 'book-checkin',
        booking: this.booking,
        room: this.room,
        unitId: this.unitId?.toString(),
      });
      console.log({ DoReservationPayload: body });
      await this.bookingService.doReservation(body);
      this.adjustBlockedUnit.emit(body);

      this.resetBookingEvt.emit(null);
    } catch (error) {
      console.log(error);
    } finally {
      this.loadingChanged.emit({ cause: null });
    }
    // alert('do reservation');
  }

  private async assignCountryCode() {
    const country = await this.bookingService.getUserDefaultCountry();
    const countryId = country['COUNTRY_ID'];
    const _c = booking_store.selects.countries.find(c => c.id?.toString() === countryId?.toString());
    updateBookedByGuest({
      countryId: countryId,
      phone_prefix: _c?.phone_prefix,
    });
  }

  private async fetchSetupEntriesAndInitialize() {
    try {
      const setupEntries = await this.fetchSetupEntries();
      this.setSourceOptions(calendar_data.property.allowed_booking_sources);
      this.setOtherProperties(setupEntries);
    } catch (error) {
      console.error('Error fetching setup entries:', error);
    }
  }

  private setOtherProperties(setupEntries: ISetupEntries) {
    setBookingSelectOptions({
      arrivalTime: setupEntries.arrivalTime,
      bedPreferences: setupEntries.bedPreferenceType,
      ratePricingMode: setupEntries.ratePricingMode,
    });
  }

  private setSourceOptions(bookingSource: BookingSource[]) {
    const _sourceOptions = this.bookingEditorService.isEventType('BAR_BOOKING') ? this.getFilteredSourceOptions(bookingSource) : bookingSource;
    setBookingSelectOptions({
      sources: _sourceOptions,
    });
    let sourceOption: BookingSource;
    if (this.bookingEditorService.isEventType('EDIT_BOOKING') && this.booking) {
      const option = bookingSource.find(option => this.booking.source?.code === option.code);
      sourceOption = option;
    } else {
      sourceOption = _sourceOptions.find(o => o.type !== 'LABEL');
    }
    setBookingDraft({
      source: sourceOption,
    });
  }

  private getFilteredSourceOptions(sourceOptions: BookingSource[]): BookingSource[] {
    const agentIds = new Set<string>();
    const hasAgentOnlyRoomType =
      calendar_data.roomsInfo?.some((rt: any) => {
        const rps = rt?.rateplans ?? [];
        if (rps.length === 0) return false;

        const isForAgentOnly = rps.every((rp: any) => (rp?.agents?.length ?? 0) > 0);
        if (isForAgentOnly) {
          rps.forEach((rp: any) => {
            (rp?.agents ?? []).forEach((ag: any) => agentIds.add(ag?.id?.toString()));
          });
        }
        return isForAgentOnly;
      }) ?? false;
    if (!hasAgentOnlyRoomType) {
      return sourceOptions;
    }
    return sourceOptions.filter((opt: any) => {
      if (opt?.type === 'LABEL') return true;
      const candidate = opt?.tag;
      const matchesId = candidate != null && agentIds.has(candidate);
      return matchesId;
    });
  }

  private async fetchSetupEntries() {
    return await this.bookingService.fetchSetupEntries();
  }

  render() {
    if (this.isLoading) {
      return (
        <div class={'drawer__loader-container'}>
          <ir-spinner></ir-spinner>
        </div>
      );
    }
    return (
      <Host>
        <div>
          <ir-interceptor></ir-interceptor>
          {this.step === 'details' && (
            <Fragment>
              <ir-booking-editor-header booking={this.booking} checkIn={this.checkIn} checkOut={this.adjustedCheckout} mode={this.mode}></ir-booking-editor-header>
              <div class={'booking-editor__roomtype-container'}>
                {booking_store.roomTypes?.map(roomType => (
                  <igl-room-type
                    key={`room-type-${roomType.id}`}
                    id={roomType.id.toString()}
                    roomType={roomType}
                    bookingType={this.mode}
                    ratePricingMode={booking_store.selects?.ratePricingMode}
                    roomTypeId={this.room?.roomtype?.id}
                    currency={calendar_data.property.currency}
                  ></igl-room-type>
                ))}
              </div>
            </Fragment>
          )}

          {this.step === 'confirm' && (
            <ir-booking-editor-form
              onDoReservation={e => {
                e.stopImmediatePropagation();
                e.stopPropagation();
                this.doReservation(e.detail);
              }}
              room={this.room}
              mode={this.mode}
            ></ir-booking-editor-form>
          )}
        </div>
      </Host>
    );
  }
}
