import { OtaService } from '@/models/booking.dto';
import { Component, Host, Prop, h } from '@stencil/core';

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
        {this.services?.map(service => (
          <ir-ota-service key={`service_${service.name}`} service={service}></ir-ota-service>
        ))}
      </Host>
    );
  }
}
