import { Component, Fragment, Host, Prop, h } from '@stencil/core';
import { Booking } from '@/models/booking.dto';
import locales from '@/stores/locales.store';
@Component({
  tag: 'ir-extra-services',
  styleUrl: 'ir-extra-services.css',
  scoped: true,
})
export class IrExtraServices {
  @Prop() booking: Pick<Booking, 'currency' | 'extra_services' | 'booking_nbr'>;

  render() {
    return (
      <Host>
        <wa-card>
          <div slot="header" class="font-size-large d-flex justify-content-between align-items-center">
            <p class={'font-size-large p-0 m-0 '}>{locales.entries.Lcz_ExtraServices}</p>
            <wa-tooltip for="extra_service_btn">Add extra service</wa-tooltip>
            <ir-custom-button id="extra_service_btn" size="small" appearance="plain" variant="neutral">
              <wa-icon name="plus" style={{ fontSize: '1rem' }}></wa-icon>
            </ir-custom-button>
          </div>
          {this.booking.extra_services?.map((service, index) => (
            <Fragment>
              <ir-extra-service
                bookingNumber={this.booking.booking_nbr}
                currencySymbol={this.booking.currency.symbol}
                key={service.booking_system_id}
                service={service}
              ></ir-extra-service>
              {index !== this.booking.extra_services.length - 1 && <hr class="mr-2 ml-2 my-0 p-0" />}
            </Fragment>
          ))}
        </wa-card>
      </Host>
    );
  }
}
