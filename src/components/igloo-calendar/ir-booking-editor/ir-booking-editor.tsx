import { Booking } from '@/models/booking.dto';
import { Component, Fragment, Host, Listen, Prop, State, h } from '@stencil/core';
import { BookingEditorMode, BookingStep } from './types';
import { RoomService } from '@/services/room.service';
import { BookingService } from '@/services/booking-service/booking.service';
import locales from '@/stores/locales.store';
import booking_store, { resetBookingStore, setBookingDraft, setBookingSelectOptions, updateBookedByGuest } from '@/stores/booking.store';
import { BookingSource } from '@/models/igl-book-property';
import calendar_data from '@/stores/calendar-data';
import { ISetupEntries } from '@/models/IBooking';
import moment from 'moment';

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
  @Prop() booking: Booking;
  @Prop() mode: BookingEditorMode = 'PLUS_BOOKING';
  @Prop() checkIn: string;
  @Prop() checkOut: string;
  @Prop() step: BookingStep;

  @State() isLoading: boolean = true;

  private roomService = new RoomService();
  private bookingService = new BookingService();

  private room: Booking['rooms'][0];

  componentWillLoad() {
    this.initializeApp();
    setBookingDraft({
      dates: {
        checkIn: this.checkIn ? moment(this.checkIn, 'YYYY-MM-DD') : moment(),
        checkOut: this.checkOut ? moment(this.checkOut, 'YYYY-MM-DD') : moment().add(1, 'day'),
      },
    });
  }

  private async initializeApp() {
    try {
      this.isLoading = true;
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

      if (this.isEventType('EDIT_BOOKING') && this.booking && this.identifier) {
        this.room = this.booking.rooms.find(room => room.identifier === this.identifier);
      }

      // const { allowed_payment_methods: paymentMethods, currency, allowed_booking_sources, adult_child_constraints, calendar_legends } = roomResponse['My_Result'];
      // this.calendarData = { currency, allowed_booking_sources, adult_child_constraints, legendData: calendar_legends };
      // this.setRoomsData(roomResponse);
      // this.showPaymentDetails = paymentMethods.some(method => paymentCodesToShow.includes(method.code));
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

  private async checkBookingAvailability() {
    // resetBookingStore(false);
    const { source, occupancy, dates } = booking_store.bookingDraft;
    const from_date = dates.checkIn.format('YYYY-MM-DD');
    const to_date = dates.checkOut.format('YYYY-MM-DD');
    const is_in_agent_mode = source?.type === 'TRAVEL_AGENCY';
    try {
      const room_type_ids_to_update = this.isEventType('EDIT_BOOKING') ? [this.room.roomtype?.id] : [];
      const room_type_ids = this.isEventType('BAR_BOOKING') ? this.roomTypeIds.map(r => Number(r)) : [];

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
      // if (!this.isEventType('EDIT_BOOKING')) {
      //   this.defaultData.defaultDateRange.fromDate = new Date(this.dateRangeData.fromDate);
      //   this.defaultData.defaultDateRange.toDate = new Date(this.dateRangeData.toDate);
      // }
      // this.defaultData = { ...this.defaultData, roomsInfo: data };
      // if (this.isEventType('EDIT_BOOKING') && !this.updatedBooking) {
      //   this.updateBooking();
      // }
    } catch (error) {
      console.error('Error initializing booking availability:', error);
    }
  }

  private isEventType(mode: BookingEditorMode): boolean {
    return this.mode === mode;
  }

  private async assignCountryCode() {
    const country = await this.bookingService.getUserDefaultCountry();
    const countryId = country['COUNTRY_ID'];
    const _c = booking_store.selects.countries.find(c => c.id?.toString() === countryId?.toString());
    // this.bookedByData = { ...this.bookedByData, isdCode: _c.phone_prefix.toString(), countryId };
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
    const _sourceOptions = this.isEventType('BAR_BOOKING') ? this.getFilteredSourceOptions(bookingSource) : bookingSource;
    setBookingSelectOptions({
      sources: _sourceOptions,
    });
    let sourceOption: BookingSource;
    if (this.isEventType('EDIT_BOOKING') && this.booking) {
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
              <ir-booking-editor-header checkIn={this.checkIn} checkOut={this.checkOut} mode={this.mode}></ir-booking-editor-header>
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

          {this.step === 'confirm' && <ir-booking-editor-form mode={this.mode}></ir-booking-editor-form>}
        </div>
      </Host>
    );
  }
}
