import { OtaService } from '@/models/booking.dto';
import { Component, Fragment, Host, Prop, h } from '@stencil/core';

@Component({
  tag: 'ir-ota-services',
  styleUrl: 'ir-ota-services.css',
  scoped: true,
})
export class IrOtaServices {
  @Prop() services: OtaService[] = [];

  render() {
    if (!this.services || this.services?.length === 0) {
      return null;
    }
    return (
      <Host>
        <div class="font-size-large d-flex justify-content-between align-items-center mb-1">
          <p class={'font-size-large p-0 m-0 '}>Channel Services</p>
        </div>
        <div class="card">
          {this.services?.map((service, idx) => (
            <Fragment>
              <ir-ota-service service={service}></ir-ota-service>
              {idx !== this.services.length - 1 && <hr class="mr-2 ml-2 my-0 p-0" />}
            </Fragment>
          ))}
        </div>
      </Host>
    );
  }
}
