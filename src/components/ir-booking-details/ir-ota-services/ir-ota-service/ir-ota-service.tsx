import { Component, Host, Prop, h } from '@stencil/core';
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
      <Host>
        <div class="p-1">
          <div class={'extra-channel-service-container'}>
            <p class="extra-channel-service-description">{this.service.name}</p>
            <div class="extra-channel-service-actions">
              {/* {this.service.total_price && <p class="extra-channel-service-price p-0 m-0 font-weight-bold">{formatAmount(this.currencySymbol, this.service.price)}</p>} */}
            </div>
          </div>
          <div class="extra-channel-service-conditional-date">
            {/* {this.service.start_date && this.service.end_date ? (
              <ir-date-view class="extra-channel-service-date-view mr-1" from_date={this.service.start_date} to_date={this.service.end_date} showDateDifference={false}></ir-date-view>
            ) : (
              this.service.start_date && <p class="extra-channel-service-date-view">{moment(new Date(this.service.start_date)).format('MMM DD, YYYY')}</p>
            )} */}
          </div>
        </div>
      </Host>
    );
  }
}
