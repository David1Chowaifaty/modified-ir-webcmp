import { Component, Prop, h } from '@stencil/core';
import { OtaService } from '@/models/booking.dto';
@Component({
  tag: 'ir-ota-service',
  styleUrl: 'ir-ota-service.css',
  scoped: true,
})
export class IrOtaService {
  @Prop() service: OtaService;
  render() {
    return (
      <div class="p-1">
        {/* <ir-label content={this.service?.name} labelText={`Name:`}></ir-label>
        <ir-label content={this.service?.nights?.toString()} labelText={`Nights:`}></ir-label>
        <ir-label content={this.service?.persons?.toString()} labelText={`Persons:`}></ir-label>
        <ir-label content={this.service?.price_mode} labelText={`Price mode:`}></ir-label>
        <ir-label content={this.service?.price_per_unit?.toString()} labelText={`Price per unit:`}></ir-label>
        <ir-label content={this.service?.total_price?.toString()} labelText={`Total price:`}></ir-label> */}
        <div class="m-0 p-0 d-flex align-items-center justify-content-between">
          <p class="m-0 d-flex align-items-center" style={{ gap: '0.5rem' }}>
            <b>{this.service.name}</b>
            <span class="p-0 m-0">
              {this.service?.persons?.toString()} {this.service.persons > 1 ? 'persons' : 'person'}
            </span>
            <span class="p-0 m-0">
              {this.service?.nights?.toString()} {this.service.nights > 1 ? 'nights' : 'night'}
            </span>
          </p>
          <b>{this.service.total_price}</b>
        </div>
        <div>
          <ir-label containerStyle={{ margin: '0', padding: '0' }} content={this.service?.price_mode} labelText={`Price mode:`}></ir-label>
          <ir-label containerStyle={{ margin: '0', padding: '0' }} class="m-0 p-0" content={this.service?.price_per_unit?.toString()} labelText={`Price per unit:`}></ir-label>
        </div>
      </div>
    );
  }
}
