import { Component, Event, EventEmitter, Host, Prop, h } from '@stencil/core';
import { IPaymentAction } from '@/services/payment.service';
import { Booking } from '@/models/booking.dto';
import { formatAmount } from '@/utils/utils';
import moment from 'moment';
@Component({
  tag: 'ir-payment-actions',
  styleUrl: 'ir-payment-actions.css',
  scoped: true,
})
export class IrPaymentActions {
  @Prop() booking: Booking;
  @Prop() paymentAction: IPaymentAction[];

  @Event() generatePayment: EventEmitter<IPaymentAction>;

  render() {
    if (this.paymentAction?.filter(pa => pa.amount !== 0).length == 0) {
      return null;
    }
    return (
      <Host>
        <div class={'my-1'}>
          <strong>Payment actions</strong>
        </div>
        <table>
          <thead>
            <th>
              <p class="sr-only">Amount</p>
            </th>
            <th>
              <p class={'sr-only'}>Due date</p>
            </th>
            <th>
              <p class={'sr-only'}>Pay</p>
            </th>
            <th>
              <p class={'sr-only'}>Status</p>
            </th>
          </thead>
          <tbody>
            {this.paymentAction?.map(pa => {
              if (!pa.due_on) {
                return null;
              }
              return (
                <tr class={'action-container'}>
                  <td class={'amount_action'}>{formatAmount(pa.currency.symbol, pa.amount)}</td>
                  <td class={'date_action'}>{moment(new Date(pa.due_on)).format('ddd, DD MMM YYYY')}</td>
                  {pa.amount > 0 && (
                    <td>
                      <ir-button btn_color="outline" text={'Pay'} size="sm" onClickHanlder={() => this.generatePayment.emit(pa)}></ir-button>
                    </td>
                  )}
                  {pa.type === 'overdue' && pa.amount > 0 && (
                    <td>
                      <div class={'overdue_action'}>
                        <svg height={16} width={16} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                          <path
                            fill="currentColor"
                            d="M256 32c14.2 0 27.3 7.5 34.5 19.8l216 368c7.3 12.4 7.3 27.7 .2 40.1S486.3 480 472 480L40 480c-14.3 0-27.6-7.7-34.7-20.1s-7-27.8 .2-40.1l216-368C228.7 39.5 241.8 32 256 32zm0 128c-13.3 0-24 10.7-24 24l0 112c0 13.3 10.7 24 24 24s24-10.7 24-24l0-112c0-13.3-10.7-24-24-24zm32 224a32 32 0 1 0 -64 0 32 32 0 1 0 64 0z"
                          />
                        </svg>
                        <span>Overdue</span>
                      </div>
                    </td>
                  )}
                  {pa.type === 'future' && pa.amount > 0 && (
                    <td>
                      <div class={'future_action '}>
                        <svg xmlns="http://www.w3.org/2000/svg" height={16} width={16} viewBox="0 0 512 512">
                          <path
                            fill="currentColor"
                            d="M256 0a256 256 0 1 1 0 512A256 256 0 1 1 256 0zM232 120l0 136c0 8 4 15.5 10.7 20l96 64c11 7.4 25.9 4.4 33.3-6.7s4.4-25.9-6.7-33.3L280 243.2 280 120c0-13.3-10.7-24-24-24s-24 10.7-24 24z"
                          />
                        </svg>
                        <span>{moment(new Date(pa.due_on)).isSame(new Date()) ? 'Today' : 'Future'}</span>
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </Host>
    );
  }
}
