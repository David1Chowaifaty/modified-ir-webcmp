import calendar_data from '@/stores/calendar-data';
import locales from '@/stores/locales.store';
import { Component, Host, Prop, h } from '@stencil/core';
import { _formatTime } from '../functions';
import moment from 'moment';
import { Booking } from '@/models/booking.dto';
@Component({
  tag: 'ir-pickup-view',
  styleUrl: 'ir-pickup-view.css',
  scoped: true,
})
export class IrPickupView {
  @Prop() booking: Booking;
  render() {
    if (!calendar_data.pickup_service.is_enabled || !this.booking.is_editable) {
      return null;
    }
    return (
      <Host>
        <wa-card>
          <p slot="header" class={'font-size-large p-0 m-0 '}>
            {locales.entries.Lcz_Pickup}
          </p>
          {/* <ir-button id="pickup" data-testid="new_pickup_btn" variant="icon" icon_name="edit" style={{ ...colorVariants.secondary, '--icon-size': '1.5rem' }}></ir-button> */}
          <wa-tooltip for="pickup">{this.booking.pickup_info ? 'Edit' : 'Add'} pickup</wa-tooltip>
          <ir-custom-button slot="header-actions" id="pickup" size="small" appearance="plain" variant="neutral">
            <wa-icon name="edit" style={{ fontSize: '1rem' }}></wa-icon>
          </ir-custom-button>

          {this.booking.pickup_info ? (
            <div class="pickup-info">
              <div class="pickup-info__primary">
                <div class="pickup-info__item">
                  <span class="pickup-info__label">{locales.entries.Lcz_Date}:</span>
                  <span>{moment(this.booking.pickup_info.date, 'YYYY-MM-DD').format('MMM DD, YYYY')}</span>
                </div>
                {this.booking.pickup_info.hour && this.booking.pickup_info.minute && (
                  <div class="pickup-info__item">
                    <span class="pickup-info__label">{locales.entries.Lcz_Time}:</span>
                    <span>{_formatTime(this.booking.pickup_info.hour.toString(), this.booking.pickup_info.minute.toString())}</span>
                  </div>
                )}
                <div class="pickup-info__item pickup-info__item--strong">
                  <span class="pickup-info__label">{locales.entries.Lcz_DueUponBooking}:</span>
                  <span>
                    {this.booking.pickup_info.currency.symbol}
                    {this.booking.pickup_info.total}
                  </span>
                </div>
              </div>

              <div class="pickup-info__item">
                <span class="pickup-info__label">{locales.entries.Lcz_FlightDetails}:</span>
                <span>{this.booking.pickup_info.details}</span>
              </div>

              <p class="pickup-info__vehicle">{this.booking.pickup_info.selected_option.vehicle.description}</p>

              <div class="pickup-info__item pickup-info__item--inline">
                <span class="pickup-info__label">{locales.entries.Lcz_NbrOfVehicles}:</span>
                <span>{this.booking.pickup_info.nbr_of_units}</span>
              </div>

              <p class="pickup-info__note">
                {calendar_data.pickup_service.pickup_instruction.description}
                {calendar_data.pickup_service.pickup_cancelation_prepayment.description}
              </p>
            </div>
          ) : (
            <div class="text-center p-1">
              <p class="text-muted">No pickup recorded yet</p>
            </div>
          )}
        </wa-card>
      </Host>
    );
  }
}
