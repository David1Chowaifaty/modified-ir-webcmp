import { Component, Event, EventEmitter, Fragment, Host, Prop, State, Watch, h } from '@stencil/core';
import { BookedByGuestSchema, BookingEditorMode } from '../types';
import { Booking } from '@/models/booking.dto';
import moment from 'moment';
import { BookingService } from '@/services/booking-service/booking.service';
import calendar_data from '@/stores/calendar-data';
import locales from '@/stores/locales.store';
import booking_store, { resetAvailability, setBookingDraft } from '@/stores/booking.store';
import { z, ZodSchema } from 'zod';
import { DateRangeChangeEvent } from '@/components';
import { isRequestPending } from '@/stores/ir-interceptor.store';
import { IRBookingEditorService } from '../ir-booking-editor.service';

@Component({
  tag: 'ir-booking-editor-header',
  styleUrl: 'ir-booking-editor-header.css',
  scoped: true,
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
  @State() datesSchema: ZodSchema;

  @Event() guestSelected: EventEmitter<Booking>;
  @Event() checkAvailability: EventEmitter<void>;

  private bookingService = new BookingService();
  private adultsSchema = z.coerce.number().min(1);

  private readonly bookingEditorService = new IRBookingEditorService();

  private BookedByGuestPickerSchema = z
    .object({
      firstName: z.string(),
      // lastName: z.string(),
    })
    .superRefine((data, ctx) => {
      if (!data.firstName) {
        ctx.addIssue({
          path: ['firstName'],
          code: z.ZodIssueCode.custom,
          message: locales.entries.Lcz_ChooseBookingNumber,
        });
      }
      // if (!data.lastName) {
      //   ctx.addIssue({
      //     path: ['lastName'],
      //     code: z.ZodIssueCode.custom,
      //     message: locales.entries.Lcz_ChooseBookingNumber,
      //   });
      // }
    });
  private pickerRef: HTMLIrPickerElement;

  // =====================
  // Handlers
  // =====================
  componentWillLoad() {
    this.createDatesSchema();
    this.bookingEditorService.setMode(this.mode);
  }

  @Watch('booking')
  handleBookingChange(newValue, oldValue) {
    if (newValue !== oldValue) {
      this.createDatesSchema();
    }
  }

  @Watch('mode')
  handleModeChange(newValue, oldValue) {
    if (newValue !== oldValue) {
      this.createDatesSchema();
      this.bookingEditorService.setMode(this.mode);
    }
  }

  // private createDatesSchema() {
  //   this.datesSchema = z.object({
  //     checkIn: z.custom(date => {
  //       if (!moment.isMoment(date)) {
  //         return false;
  //       }
  //       if (['SPLIT_BOOKING', 'ADD_ROOM'].includes(this.mode) && !date.isSameOrBefore(this.booking.to_date)) {
  //         return false;
  //       }
  //       return true;
  //     }),
  //     checkOut: z.custom(data => moment.isMoment(data)),
  //   });
  // }
  private createDatesSchema() {
    this.datesSchema = z
      .object({
        checkIn: z.any(),
        checkOut: z.any(),
      })
      .superRefine((data, ctx) => {
        // ─────────────────────────────
        // checkIn validations
        // ─────────────────────────────

        if (!moment.isMoment(data.checkIn)) {
          ctx.addIssue({
            path: ['checkIn'],
            code: z.ZodIssueCode.custom,
            message: 'Check-in date is required',
          });
        }

        if (moment.isMoment(data.checkIn) && this.bookingEditorService.isEventType(['SPLIT_BOOKING', 'ADD_ROOM']) && !data.checkIn.isSameOrBefore(this.booking.to_date)) {
          ctx.addIssue({
            path: ['checkIn'],
            code: z.ZodIssueCode.custom,
            message: `${locales.entries.Lcz_CheckInDateShouldBeMAx.replace('%1', moment(this.booking.from_date, 'YYYY-MM-DD').format('ddd, DD MMM YYYY')).replace(
              '%2',
              moment(this.booking.to_date, 'YYYY-MM-DD').format('ddd, DD MMM YYYY'),
            )}  `,
          });
        }

        // ─────────────────────────────
        // checkOut validations
        // ─────────────────────────────

        if (!moment.isMoment(data.checkOut)) {
          ctx.addIssue({
            path: ['checkOut'],
            code: z.ZodIssueCode.custom,
            message: 'Check-out date is required',
          });
        }
      });
  }
  private async handleBookingSearch(value: string) {
    try {
      this.isLoading = true;
      if (!value) {
        this.pickerRef.clearInput();
        return;
      }
      this.bookings = await this.bookingService.fetchExposedBookings(value, calendar_data.property.id, this.checkIn, this.checkOut);
    } catch (error) {
      console.error(error);
    } finally {
      this.isLoading = false;
    }
  }

  private handleSubmit(event: Event): void {
    event.preventDefault();
    this.stopEvent(event);
    try {
      if (this.mode === 'SPLIT_BOOKING' && !booking_store.bookedByGuest.firstName) {
        BookedByGuestSchema.parse(booking_store.bookedByGuest);
      }
      this.datesSchema.parse(booking_store.bookingDraft.dates);
      this.adultsSchema.parse(booking_store.bookingDraft?.occupancy?.adults);
      this.checkAvailability.emit();
    } catch (error) {
      console.error(error);
    }
  }

  private handleDateRangeChange(event: CustomEvent<DateRangeChangeEvent>): void {
    this.stopEvent(event);
    resetAvailability();
    setBookingDraft({ dates: event.detail });
  }

  private handleSourceChange(event: Event): void {
    this.stopEvent(event);
    const value = (event.target as HTMLSelectElement).value;
    const source = booking_store.selects.sources.find(s => s.id === value);
    setBookingDraft({ source });
  }

  private handleAdultsChange(event: Event): void {
    this.stopEvent(event);
    resetAvailability();
    const adults = Number((event.target as HTMLSelectElement).value);
    const { children } = booking_store.bookingDraft.occupancy;

    setBookingDraft({
      occupancy: { adults, children },
    });
  }

  private handleChildrenChange(event: Event): void {
    this.stopEvent(event);
    resetAvailability();
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
    const today = moment();
    switch (this.mode) {
      case 'EDIT_BOOKING':
        return today.add(-2, 'weeks').format('YYYY-MM-DD');
      case 'ADD_ROOM':
        return this.booking?.from_date;
      case 'SPLIT_BOOKING':
      default:
        if (this.checkIn) return this.checkIn;
        return today.format('YYYY-MM-DD');
    }
  }

  private get maxDate() {
    const today = moment();
    const next60Days = today.add(60, 'days').format('YYYY-MM-DD');

    switch (this.mode) {
      case 'PLUS_BOOKING':
        // if (this.checkOut) return this.checkOut;
        return next60Days;
      case 'ADD_ROOM':
      // return this.booking.to_date;
      case 'SPLIT_BOOKING':
      default:
        return next60Days;
    }
  }

  private get childrenSelectPlaceholder() {
    const { child_max_age } = calendar_data.property.adult_child_constraints;
    const years = child_max_age === 1 ? locales.entries.Lcz_Year : locales.entries.Lcz_Years;

    return `${locales.entries.Lcz_ChildCaption} 0 - ${child_max_age} ${years}`;
  }

  private async selectGuest(e: CustomEvent) {
    this.stopEvent(e);
    const booking_nbr = e.detail?.item?.value;
    const booking = await this.bookingService.getExposedBooking(booking_nbr, 'en', true);
    this.guestSelected.emit(booking);
  }

  render() {
    const { sources } = booking_store.selects;
    const { adults, children } = booking_store.bookingDraft.occupancy;
    const { checkIn, checkOut } = booking_store.bookingDraft.dates;

    return (
      <Host>
        <form onSubmit={this.handleSubmit.bind(this)}>
          {this.bookingEditorService.isEventType('SPLIT_BOOKING') && (
            <ir-validator value={booking_store.bookedByGuest} class="booking-editor-header__booking-picker-validator" showErrorMessage schema={this.BookedByGuestPickerSchema}>
              <ir-picker
                withClear
                mode="select-async"
                class="booking-editor-header__booking-picker"
                debounce={300}
                ref={el => (this.pickerRef = el)}
                label={`${locales.entries.Lcz_Tobooking}#`}
                // defaultValue={Object.keys(this.bookedByInfoData).length > 1 ? this.bookedByInfoData.bookingNumber?.toString() : ''}
                // value={Object.keys(this.bookedByInfoData).length > 1 ? this.bookedByInfoData.bookingNumber?.toString() : ''}
                placeholder={locales.entries.Lcz_BookingNumber}
                loading={this.isLoading}
                onText-change={e => this.handleBookingSearch(e.detail)}
                onCombobox-select={this.selectGuest.bind(this)}
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
            </ir-validator>
          )}

          <div class="booking-editor-header__container">
            {!this.bookingEditorService.isEventType(['EDIT_BOOKING', 'ADD_ROOM', 'SPLIT_BOOKING']) && (
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
            )}
            <ir-validator
              class="booking-editor__date-validator"
              showErrorMessage
              value={booking_store.bookingDraft.dates}
              schema={this.datesSchema}
              style={{ position: 'relative' }}
            >
              <igl-date-range
                defaultData={{
                  fromDate: checkIn?.format('YYYY-MM-DD') ?? '',
                  toDate: checkOut?.format('YYYY-MM-DD') ?? '',
                }}
                variant="booking"
                withDateDifference
                minDate={this.minDate}
                maxDate={this.maxDate}
                onDateRangeChange={this.handleDateRangeChange.bind(this)}
              />
            </ir-validator>
            {!this.bookingEditorService.isEventType('EDIT_BOOKING') && (
              <Fragment>
                <ir-validator value={adults} schema={this.adultsSchema}>
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
              </Fragment>
            )}

            <ir-custom-button loading={isRequestPending('/Check_Availability')} type="submit" variant="brand">
              Check
            </ir-custom-button>
          </div>
        </form>
      </Host>
    );
  }
}
