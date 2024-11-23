import { Component, Fragment, Host, Prop, h } from '@stencil/core';
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
      <Host class={'card p-0 m-0'}>
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
      </Host>
    );
  }
}
