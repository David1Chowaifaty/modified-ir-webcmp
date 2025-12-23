import booking_store, { calculateTotalRooms, getBookingTotalPrice, IRatePlanSelection, updateBookedByGuest } from '@/stores/booking.store';
import calendar_data from '@/stores/calendar-data';
import locales from '@/stores/locales.store';
import { formatAmount } from '@/utils/utils';
import { Component, Event, EventEmitter, h, Prop, State } from '@stencil/core';
import { BookingEditorMode } from '../types';
import { calculateDaysBetweenDates } from '@/utils/booking';
import { Room } from '@/models/booking.dto';
import { BookingService } from '@/services/booking-service/booking.service';
import { ExposedGuests } from '@/services/booking-service/types';
import { isRequestPending } from '@/stores/ir-interceptor.store';

@Component({
  tag: 'ir-booking-editor-form',
  styleUrl: 'ir-booking-editor-form.css',
  scoped: true,
})
export class IrBookingEditorForm {
  @Prop() mode: BookingEditorMode = 'PLUS_BOOKING';
  @Prop() room: Room;

  @State() guests: ExposedGuests;
  @Event() doReservation: EventEmitter<string>;

  private bookingService = new BookingService();

  private async fetchGuests(email: string) {
    try {
      if (!email) {
        return;
      }
      this.guests = await this.bookingService.fetchExposedGuest(email, calendar_data.property.id);
    } catch (error) {
      console.log(error);
    }
  }

  private handleComboboxSelect(e: CustomEvent) {
    const guest = this.guests?.find(guest => guest.id?.toString() === e.detail.item.value);
    if (!guest) {
      console.warn(`guest not found with id ${e.detail.item.value}`);
      return;
    }
    updateBookedByGuest({
      id: guest.id,
      email: guest.email,
      firstName: guest.first_name,
      lastName: guest.last_name,
      mobile: guest.mobile_without_prefix,
      countryId: guest.country_id?.toString(),
      phone_prefix: guest['country_phone_prefix'],
    });
  }
  render() {
    const { dates } = booking_store.bookingDraft;
    let hasBookedByGuestController = false;
    const totalRooms = calculateTotalRooms();
    const totalCost = totalRooms > 1 ? getBookingTotalPrice() : 0;
    return (
      <form
        class="booking-editor__guest-form"
        id="new_booking_form"
        autoComplete="off"
        onSubmit={e => {
          e.preventDefault();
          const submitter = (e as SubmitEvent).submitter as any | null;
          this.doReservation.emit(submitter?.value);
        }}
      >
        <div class="booking-editor__header">
          <ir-date-view
            class="booking-editor__dates mr-1 flex-fill font-weight-bold font-medium-1"
            from_date={dates.checkIn}
            to_date={dates.checkOut}
            dateOption="DD MMM YYYY"
          ></ir-date-view>

          {totalRooms > 1 && (
            <div class="booking-editor__total mt-1 mt-md-0 text-right">
              <span class="booking-editor__total-label">{locales.entries.Lcz_TotalPrice}</span>{' '}
              <span class="booking-editor__total-amount font-weight-bold font-medium-1">{formatAmount(calendar_data.property.currency.symbol, totalCost)}</span>
            </div>
          )}
        </div>
        {Object.values(booking_store.ratePlanSelections).map(val =>
          Object.values(val).map(ratePlan => {
            const rp = ratePlan as IRatePlanSelection;
            if (rp.reserved === 0) {
              return null;
            }

            return [...new Array(rp.reserved)].map((_, i) => {
              const shouldAutoFillGuest = !hasBookedByGuestController && !booking_store.bookedByGuestManuallyEdited;
              if (shouldAutoFillGuest) {
                hasBookedByGuestController = true;
              }
              return (
                <igl-application-info
                  autoFillGuest={booking_store.bookedByGuest.id !== -1 && shouldAutoFillGuest}
                  totalNights={calculateDaysBetweenDates(dates.checkIn.format('YYYY-MM-DD'), dates.checkOut.format('YYYY-MM-DD'))}
                  bedPreferenceType={booking_store.selects.bedPreferences}
                  currency={calendar_data.property.currency}
                  guestInfo={rp.guest ? rp.guest[i] : null}
                  bookingType={this.mode}
                  rateplanSelection={rp}
                  key={`${rp.ratePlan.id}_${i}`}
                  roomIndex={i}
                  baseData={
                    this.mode === 'EDIT_BOOKING'
                      ? {
                          roomtypeId: this.room.roomtype.id,
                          unit: this.room.unit as any,
                        }
                      : undefined
                  }
                ></igl-application-info>
              );
            });
          }),
        )}
        {['BAR_BOOKING', 'PLUS_BOOKING'].includes(this.mode) && (
          <section class={'mt-2'}>
            <div class="booking-editor__booked-by booking-editor__booked-by-header">
              <h4 class="booking-editor__heading booking-editor__booked-by-title">Booked by</h4>

              <ir-picker
                class="booking-editor__booked-by-picker"
                appearance="filled"
                placeholder="Search customer by email, name or company name"
                withClear
                onText-change={event => this.fetchGuests(event.detail)}
                debounce={500}
                loading={isRequestPending('/Fetch_Exposed_Guests')}
                mode="select-async"
                onCombobox-select={this.handleComboboxSelect.bind(this)}
              >
                {this.guests?.map(guest => {
                  const label = `${guest.email} - ${guest.first_name} ${guest.last_name}`;
                  return (
                    <ir-picker-item label={label} value={guest.id?.toString()} key={guest.id}>
                      {label}
                    </ir-picker-item>
                  );
                })}
              </ir-picker>
            </div>
            <ir-booking-editor-guest-form></ir-booking-editor-guest-form>
          </section>
        )}
      </form>
    );
  }
}
