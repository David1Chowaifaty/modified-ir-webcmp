import { Component, Fragment, Prop, h } from '@stencil/core';
import { Booking } from '@/models/booking.dto';
@Component({
  tag: 'ir-extra-services',
  styleUrl: 'ir-extra-services.css',
  scoped: true,
})
export class IrExtraServices {
  @Prop() booking: Pick<Booking, 'currency' | 'extra_services' | 'booking_nbr'>;

  render() {
    return (
      <sl-card class={' p-0 '}>
        {this.booking.extra_services?.map((service, index) => (
          <Fragment>
            <ir-extra-service
              bookingNumber={this.booking.booking_nbr}
              currencySymbol={this.booking.currency.symbol}
              key={service.booking_system_id}
              service={service}
            ></ir-extra-service>
            {index !== this.booking.extra_services.length - 1 && <sl-divider></sl-divider>}
          </Fragment>
        ))}
      </sl-card>
    );
  }
}
