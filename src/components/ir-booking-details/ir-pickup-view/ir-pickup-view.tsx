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
              <div class="pickup-info__summary">
                <div>
                  <p class="pickup-info__datetime">
                    {moment(this.booking.pickup_info.date, 'YYYY-MM-DD').format('MMM DD, YYYY')}
                    {this.booking.pickup_info.hour && this.booking.pickup_info.minute && (
                      <span> • {_formatTime(this.booking.pickup_info.hour.toString(), this.booking.pickup_info.minute.toString())}</span>
                    )}
                  </p>
                </div>
                <p class="pickup-info__due">
                  {/* {locales.entries.Lcz_DueUponBooking}:{' '} */}
                  <strong>
                    {this.booking.pickup_info.currency.symbol}
                    {this.booking.pickup_info.total}
                  </strong>
                </p>
              </div>

              <div class="pickup-info__details">
                <ir-label display="inline" labelText={`${locales.entries.Lcz_FlightDetails}:`} content={this.booking.pickup_info.details}></ir-label>
                <p class="pickup-info__line">
                  <span class="pickup-info__label">Vehicle:</span>
                  <span>{this.booking.pickup_info.selected_option.vehicle.description}</span>
                </p>
                <p class="pickup-info__line">
                  <span class="pickup-info__label">{locales.entries.Lcz_NbrOfVehicles}:</span>
                  <strong>{this.booking.pickup_info.nbr_of_units}</strong>
                </p>
              </div>

              <p class="pickup-info__note">
                {calendar_data.pickup_service.pickup_instruction.description}
                {calendar_data.pickup_service.pickup_cancelation_prepayment.description}
              </p>
            </div>
          ) : (
            <ir-empty-state></ir-empty-state>
          )}
        </wa-card>
      </Host>
    );
  }
}
