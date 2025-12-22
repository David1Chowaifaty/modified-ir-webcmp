import booking_store, { calculateTotalRooms, getBookingTotalPrice, IRatePlanSelection } from '@/stores/booking.store';
import calendar_data from '@/stores/calendar-data';
import locales from '@/stores/locales.store';
import { formatAmount } from '@/utils/utils';
import { Component, h, Prop } from '@stencil/core';
import { BookingEditorMode } from '../types';
import { calculateDaysBetweenDates } from '@/utils/booking';
import { Room } from '@/models/booking.dto';

@Component({
  tag: 'ir-booking-editor-form',
  styleUrl: 'ir-booking-editor-form.css',
  scoped: true,
})
export class IrBookingEditorForm {
  @Prop() mode: BookingEditorMode = 'PLUS_BOOKING';
  @Prop() room: Room;

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
                  autoFillGuest={totalRooms === 1 && shouldAutoFillGuest}
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
        <section class={'mt-2'}>
          <h4 class="booking-editor__heading">Booked by</h4>
          <ir-picker class="mb-1" style={{ maxWidth: '48.5%' }} placeholder="Search customer by email, name or company name"></ir-picker>
          <ir-booking-editor-guest-form></ir-booking-editor-guest-form>
        </section>
      </form>
    );
  }
}
