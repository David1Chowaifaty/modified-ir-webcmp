import { Booking } from '@/models/booking.dto';
import { formatAmount } from '@/utils/utils';
import { Component, Event, EventEmitter, Host, Prop, h } from '@stencil/core';

@Component({
  tag: 'ir-balance-cell',
  styleUrl: 'ir-balance-cell.css',
  scoped: true,
})
export class IrBalanceCell {
  @Prop() financial!: Booking['financial'];
  @Prop() statusCode!: string;
  @Prop() isDirect!: boolean;
  @Prop() bookingNumber!: string;
  @Prop() currencySymbol!: string;

  @Event({ composed: true, bubbles: true }) payBookingBalance: EventEmitter<string>;

  render() {
    return (
      <Host>
        <p class="ir-price">{formatAmount(this.currencySymbol, this.financial.gross_total)}</p>
        <div class="balance_button-container">
          {['003', '004'].includes(this.statusCode) && this.isDirect
            ? this.financial.cancelation_penality_as_if_today !== 0 &&
              this.financial.due_amount !== 0 && (
                <ir-custom-button
                  onClickHandler={() => {
                    this.payBookingBalance.emit(this.bookingNumber);
                  }}
                  style={{ '--ir-c-btn-height': '0.5rem' }}
                  size="small"
                  variant="danger"
                  appearance="outlined"
                >
                  <span>{this.financial.cancelation_penality_as_if_today < 0 ? 'Refund' : 'Charge'} </span>
                  {formatAmount(this.currencySymbol, Math.abs(this.financial.cancelation_penality_as_if_today))}
                </ir-custom-button>
              )
            : this.financial.due_amount !== 0 && (
                <ir-custom-button
                  onClickHandler={() => {
                    this.payBookingBalance.emit(this.bookingNumber);
                  }}
                  style={{ '--ir-c-btn-height': '1.5rem' }}
                  size="small"
                  variant="danger"
                  appearance="outlined"
                >
                  {formatAmount(this.currencySymbol, this.financial.due_amount)}
                </ir-custom-button>
              )}
        </div>
      </Host>
    );
  }
}
