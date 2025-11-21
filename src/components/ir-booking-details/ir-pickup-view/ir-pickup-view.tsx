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
          <div slot="header" class={'d-flex w-100  align-items-center justify-content-between'}>
            <p class={'font-size-large p-0 m-0 '}>{locales.entries.Lcz_Pickup}</p>
            {/* <ir-button id="pickup" data-testid="new_pickup_btn" variant="icon" icon_name="edit" style={{ ...colorVariants.secondary, '--icon-size': '1.5rem' }}></ir-button> */}
            <wa-tooltip for="pickup">{this.booking.pickup_info ? 'Edit' : 'Add'} pickup</wa-tooltip>
            <ir-custom-button id="pickup" size="small" appearance="plain" variant="neutral">
              <wa-icon name="edit" style={{ fontSize: '1rem' }}></wa-icon>
            </ir-custom-button>
          </div>
          {this.booking.pickup_info && (
            <div>
              <div class={'d-flex align-items-center py-0 my-0 pickup-margin'}>
                <p class={'font-weight-bold mr-1 py-0 my-0'}>
                  {locales.entries.Lcz_Date}: <span class={'font-weight-normal'}>{moment(this.booking.pickup_info.date, 'YYYY-MM-DD').format('MMM DD, YYYY')}</span>
                </p>
                {this.booking.pickup_info.hour && this.booking.pickup_info.minute && (
                  <p class={'font-weight-bold flex-fill py-0 my-0'}>
                    {locales.entries.Lcz_Time}:
                    <span class={'font-weight-normal'}> {_formatTime(this.booking.pickup_info.hour.toString(), this.booking.pickup_info.minute.toString())}</span>
                  </p>
                )}
                <p class={'font-weight-bold py-0 my-0'}>
                  {locales.entries.Lcz_DueUponBooking}:{' '}
                  <span class={'font-weight-normal'}>
                    {this.booking.pickup_info.currency.symbol}
                    {this.booking.pickup_info.total}
                  </span>
                </p>
              </div>
              <p class={'font-weight-bold py-0 my-0'}>
                {locales.entries.Lcz_FlightDetails}:<span class={'font-weight-normal'}> {`${this.booking.pickup_info.details}`}</span>
              </p>
              <p class={'py-0 my-0 pickup-margin'}>{`${this.booking.pickup_info.selected_option.vehicle.description}`}</p>
              <p class={'font-weight-bold py-0 my-0 pickup-margin'}>
                {locales.entries.Lcz_NbrOfVehicles}:<span class={'font-weight-normal'}> {`${this.booking.pickup_info.nbr_of_units}`}</span>
              </p>
              <p class={'small py-0 my-0 pickup-margin'}>
                {calendar_data.pickup_service.pickup_instruction.description}
                {calendar_data.pickup_service.pickup_cancelation_prepayment.description}
              </p>
            </div>
          )}
        </wa-card>
      </Host>
    );
  }
}
