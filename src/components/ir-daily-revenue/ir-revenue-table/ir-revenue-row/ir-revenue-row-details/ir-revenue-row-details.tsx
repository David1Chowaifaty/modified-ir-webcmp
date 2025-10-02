import { FolioPayment } from '@/components';
import { Component, Event, EventEmitter, Host, Prop, h } from '@stencil/core';
import { formatAmount } from '@/utils/utils';
import calendar_data from '@/stores/calendar-data';
import { _formatTime } from '@/components/ir-booking-details/functions';
import { SidebarOpenEvent } from '@/components/ir-daily-revenue/types';

@Component({
  tag: 'ir-revenue-row-details',
  styleUrl: 'ir-revenue-row-details.css',
  scoped: true,
})
export class IrRevenueRowDetails {
  @Prop() payment: FolioPayment;
  @Event() revenueOpenSidebar: EventEmitter<SidebarOpenEvent>;

  render() {
    return (
      <Host>
        <div class="ir-revenue-row-detail">
          <div class="ir-revenue-row-detail__info">
            <div class="ir-revenue-row-detail__time">
              <span class="ir-revenue-row-detail__label">{this.payment.date}</span>
              <span class="ir-revenue-row-detail__value">{_formatTime(this.payment.hour.toString(), this.payment.minute.toString())}</span>
              <div class="ir-revenue-row-detail__amount">{formatAmount(calendar_data.property.currency.symbol, this.payment.amount)}</div>
            </div>

            <div class="ir-revenue-row-detail__meta">
              <div class="ir-revenue-row-detail__user">
                <span class="ir-revenue-row-detail__label">User:</span>
                <span class="ir-revenue-row-detail__value">{this.payment.user}</span>
              </div>
              <div class="ir-revenue-row-detail__booking">
                <ir-button
                  variant="default"
                  btn_color="link"
                  text={this.payment.bookingNbr}
                  class="ir-revenue-row-detail__booking-btn"
                  size="sm"
                  onClickHandler={e => {
                    e.stopImmediatePropagation();
                    e.stopPropagation();
                    this.revenueOpenSidebar.emit({
                      payload: {
                        bookingNumber: Number(this.payment.bookingNbr),
                      },
                      type: 'booking',
                    });
                  }}
                  btnStyle={{ width: 'fit-content', margin: '0', padding: '0', fontSize: 'inherit', textAlign: 'center', lineHeight: '1.2' }}
                ></ir-button>
              </div>
            </div>
          </div>

          <div class="ir-revenue-row-detail__amount">{formatAmount(calendar_data.property.currency.symbol, this.payment.amount)}</div>
        </div>
      </Host>
    );
  }
}
