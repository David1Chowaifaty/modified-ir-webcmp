import { Payment } from '@/components/ir-booking-details/types';
import { Booking } from '@/models/booking.dto';
import calendar_data from '@/stores/calendar-data';
import { formatAmount } from '@/utils/utils';
import { Component, Event, EventEmitter, Host, Prop, h } from '@stencil/core';
import moment from 'moment';

@Component({
  tag: 'ir-balance-cell',
  styleUrl: 'ir-balance-cell.css',
  scoped: true,
})
export class IrBalanceCell {
  @Prop() label: string;
  @Prop({ reflect: true }) display: 'inline' | 'block' = 'inline';
  @Prop() financial!: Booking['financial'];
  @Prop() statusCode!: string;
  @Prop() isDirect!: boolean;
  @Prop() bookingNumber!: string;
  @Prop() currencySymbol!: string;

  @Event({ composed: true, bubbles: true }) payBookingBalance: EventEmitter<{ booking_nbr: string; payment: Payment }>;

  render() {
    return (
      <Host>
        {this.label && <p class="cell-label">{this.label}:</p>}
        <p class="ir-price">{formatAmount(this.currencySymbol, this.financial.gross_total)}</p>
        <div class="balance_button-container">
          {['003', '004'].includes(this.statusCode) && this.isDirect
            ? this.financial.cancelation_penality_as_if_today !== 0 &&
              this.financial.due_amount !== 0 && (
                <ir-custom-button
                  onClickHandler={() => {
                    this.payBookingBalance.emit({
                      booking_nbr: this.bookingNumber,
                      payment: {
                        amount: Math.abs(this.financial.cancelation_penality_as_if_today),
                        currency: calendar_data.property.currency,
                        date: moment().format('YYYY-MM-DD'),
                        designation: null,
                        payment_method: null,
                        payment_type: { code: this.financial.cancelation_penality_as_if_today < 0 ? '010' : '001', description: null, operation: null },
                        id: -1,
                        reference: '',
                      },
                    });
                  }}
                  style={{ '--ir-c-btn-height': 'fit-content', '--ir-c-btn-padding': '0.25rem', '--ir-c-btn-font-size': '0.725rem' }}
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
                    this.payBookingBalance.emit({
                      booking_nbr: this.bookingNumber,
                      payment: {
                        amount: this.financial.due_amount,
                        currency: calendar_data.property.currency,
                        date: moment().format('YYYY-MM-DD'),
                        designation: null,
                        payment_method: null,
                        payment_type: { code: '001', description: null, operation: null },
                        id: -1,
                        reference: '',
                      },
                    });
                  }}
                  style={{ '--ir-c-btn-height': 'fit-content', '--ir-c-btn-padding': '0.25rem', '--ir-c-btn-font-size': '0.725rem' }}
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
