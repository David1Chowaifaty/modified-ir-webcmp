import { Component, Event, EventEmitter, Host, Prop, State, h } from '@stencil/core';
import { BookingEditorMode } from '../types';
import { Booking } from '@/models/booking.dto';
import moment from 'moment';
import { BookingService } from '@/services/booking-service/booking.service';
import calendar_data from '@/stores/calendar-data';
import locales from '@/stores/locales.store';
import booking_store, { setBookingDraft } from '@/stores/booking.store';
import { z } from 'zod';
import { DateRangeChangeEvent } from '@/components';

@Component({
  tag: 'ir-booking-editor-header',
  styleUrl: 'ir-booking-editor-header.css',
  shadow: true,
})
export class IrBookingEditorHeader {
  /** Booking context used for edit, add-room, and split flows */
  @Prop() booking: Booking;

  /** Controls header behavior and date constraints */
  @Prop() mode: BookingEditorMode = 'PLUS_BOOKING';

  /** Fixed check-in date (YYYY-MM-DD), if applicable */
  @Prop() checkIn: string;

  /** Fixed check-out date (YYYY-MM-DD), if applicable */
  @Prop() checkOut: string;

  @State() isLoading: boolean;
  @State() bookings: Booking[] = [];

  @Event() checkAvailability: EventEmitter<void>;

  private bookingService = new BookingService();
  private adultsSchema = z.coerce.number().min(1);

  // =====================
  // Handlers
  // =====================

  private async handleBookingSearch(value: string) {
    try {
      this.isLoading = true;
      this.bookings = await this.bookingService.fetchExposedBookings(value, calendar_data.property.id, this.checkIn, this.checkOut);
    } catch (error) {
      console.error(error);
    } finally {
      this.isLoading = false;
    }
  }

  private handleSubmit(event: Event): void {
    this.stopEvent(event);
    event.stopPropagation();

    try {
      this.adultsSchema.parse(booking_store.bookingDraft?.occupancy?.adults);
      this.checkAvailability.emit();
    } catch (error) {
      console.error(error);
    }
  }

  private handleDateRangeChange(event: CustomEvent<DateRangeChangeEvent>): void {
    this.stopEvent(event);
    setBookingDraft({ dates: event.detail });
  }

  private handleSourceChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    const source = booking_store.selects.sources.find(s => s.id === value);
    setBookingDraft({ source });
  }

  private handleAdultsChange(event: Event): void {
    const adults = Number((event.target as HTMLSelectElement).value);
    const { children } = booking_store.bookingDraft.occupancy;

    setBookingDraft({
      occupancy: { adults, children },
    });
  }

  private handleChildrenChange(event: Event): void {
    const children = Number((event.target as HTMLSelectElement).value);
    const { adults } = booking_store.bookingDraft.occupancy;

    setBookingDraft({
      occupancy: { adults, children },
    });
  }

  private stopEvent(event: Event): void {
    event.stopImmediatePropagation();
    event.stopPropagation();
  }

  // =====================
  // Computed values
  // =====================

  private get minDate() {
    if (this.checkIn) return this.checkIn;

    const today = moment();

    switch (this.mode) {
      case 'EDIT_BOOKING':
        return today.add(-2, 'weeks').format('YYYY-MM-DD');
      case 'ADD_ROOM':
      case 'SPLIT_BOOKING':
        return this.booking.from_date;
      default:
        return today.format('YYYY-MM-DD');
    }
  }

  private get maxDate() {
    if (this.checkOut) return this.checkOut;

    const today = moment();

    switch (this.mode) {
      case 'ADD_ROOM':
      case 'SPLIT_BOOKING':
        return this.booking.to_date;
      default:
        return today.add(60, 'days').format('YYYY-MM-DD');
    }
  }

  private get childrenSelectPlaceholder() {
    const { child_max_age } = calendar_data.property.adult_child_constraints;
    const years = child_max_age === 1 ? locales.entries.Lcz_Year : locales.entries.Lcz_Years;

    return `${locales.entries.Lcz_ChildCaption} 0 - ${child_max_age} ${years}`;
  }

  render() {
    const { sources } = booking_store.selects;
    const { adults, children } = booking_store.bookingDraft.occupancy;
    const { checkIn, checkOut } = booking_store.bookingDraft.dates;

    return (
      <Host>
        <form onSubmit={this.handleSubmit}>
          {this.mode === 'SPLIT_BOOKING' && (
            <ir-picker
              mode="select-async"
              class="booking-editor-header__booking-picker"
              debounce={300}
              label={`${locales.entries.Lcz_Tobooking}#`}
              // defaultValue={Object.keys(this.bookedByInfoData).length > 1 ? this.bookedByInfoData.bookingNumber?.toString() : ''}
              // value={Object.keys(this.bookedByInfoData).length > 1 ? this.bookedByInfoData.bookingNumber?.toString() : ''}
              placeholder={locales.entries.Lcz_BookingNumber}
              loading={this.isLoading}
              onText-change={e => this.handleBookingSearch(e.detail)}
              onCombobox-select={this.stopEvent.bind(this)}
            >
              {this.bookings.map(b => {
                const label = `${b.booking_nbr} ${b.guest.first_name} ${b.guest.last_name}`;
                return (
                  <ir-picker-item value={b.booking_nbr?.toString()} label={label}>
                    {label}
                  </ir-picker-item>
                );
              })}
            </ir-picker>
          )}

          <div class="booking-editor-header__container">
            <wa-select
              size="small"
              placeholder={locales.entries.Lcz_Source}
              value={booking_store.bookingDraft.source?.id?.toString()}
              defaultValue={booking_store.bookingDraft.source?.id}
              onwa-hide={this.stopEvent.bind(this)}
              onchange={this.handleSourceChange.bind(this)}
            >
              {sources.map(option => (option.type === 'LABEL' ? <small>{option.description}</small> : <wa-option value={option.id?.toString()}>{option.description}</wa-option>))}
            </wa-select>

            <igl-date-range
              defaultData={{
                fromDate: checkIn?.format('YYYY-MM-DD') ?? '',
                toDate: checkOut?.format('YYYY-MM-DD') ?? '',
              }}
              minDate={this.minDate}
              maxDate={this.maxDate}
              onDateRangeChange={this.handleDateRangeChange.bind(this)}
            />

            <ir-validator value={adults} schema={this.adultsSchema} autovalidate>
              <wa-select
                class="booking-editor-header__adults-select"
                size="small"
                placeholder={locales.entries.Lcz_AdultsCaption}
                value={adults?.toString()}
                defaultValue={adults?.toString()}
                onwa-hide={this.stopEvent.bind(this)}
                onchange={this.handleAdultsChange.bind(this)}
              >
                {Array.from({ length: calendar_data.property.adult_child_constraints.adult_max_nbr }, (_, i) => i + 1).map(option => (
                  <wa-option value={option.toString()}>{option}</wa-option>
                ))}
              </wa-select>
            </ir-validator>

            {calendar_data.property.adult_child_constraints.child_max_nbr > 0 && (
              <wa-select
                class="booking-editor-header__children-select"
                size="small"
                placeholder={this.childrenSelectPlaceholder}
                value={children?.toString()}
                defaultValue={children?.toString()}
                onwa-hide={this.stopEvent.bind(this)}
                onchange={this.handleChildrenChange.bind(this)}
              >
                {Array.from({ length: calendar_data.property.adult_child_constraints.child_max_nbr }, (_, i) => i + 1).map(option => (
                  <wa-option value={option.toString()}>{option}</wa-option>
                ))}
              </wa-select>
            )}

            <ir-custom-button type="submit" variant="brand">
              Check
            </ir-custom-button>
          </div>
        </form>
      </Host>
    );
  }
}
