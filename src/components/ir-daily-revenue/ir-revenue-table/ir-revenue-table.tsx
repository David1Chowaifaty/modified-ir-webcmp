import { Component, Event, EventEmitter, Fragment, h, Prop } from '@stencil/core';
import { GroupedFolioPayment } from '../types';
import { IEntries } from '@/models/IBooking';
import moment from 'moment';

@Component({
  tag: 'ir-revenue-table',
  styleUrl: 'ir-revenue-table.css',
  scoped: true,
})
export class IrRevenueTable {
  @Prop() payments: GroupedFolioPayment = new Map();
  @Prop() payTypes: IEntries[];
  @Prop() date: string;

  private payTypesObj: {};
  @Event() fetchNewReports: EventEmitter<string>;

  componentWillLoad() {
    let pt = {};
    this.payTypes.forEach(p => {
      pt = { ...pt, [p.CODE_NAME]: p.CODE_VALUE_EN };
    });
    this.payTypesObj = pt;
  }

  render() {
    return (
      <div class="card p-1 revenue-table__table">
        <div class={'revenue-table__title-section'}>
          <p class="m-0 p-0">Payment transactions</p>
          <div class="">
            <ir-date-picker
              data-testid="pickup_date"
              date={this.date}
              class="w-100"
              emitEmptyDate={true}
              maxDate={moment().format('YYYY-MM-DD')}
              onDateChanged={evt => {
                evt.stopImmediatePropagation();
                evt.stopPropagation();
                this.fetchNewReports.emit(evt.detail.start?.format('YYYY-MM-DD'));
              }}
            >
              <div slot="trigger" class="revenue-table__date-picker">
                <div class="revenue-table__date-picker-icon">
                  <ir-icons name="calendar" style={{ '--icon-size': '1rem' }}></ir-icons>
                </div>
                <input type="text" value={this?.date} class={`revenue-table__date-picker-input form-control w-100 input-sm  text-center`} style={{ width: '100%' }}></input>
              </div>
            </ir-date-picker>
          </div>
        </div>
        {this.payments.size > 0 ? (
          <Fragment>
            <div class="revenue-table__header">
              <p>Method</p>
              <p>Amount</p>
            </div>
            {Array.from(this.payments.entries()).map(([key, p]) => {
              return <ir-revenue-row key={key} payments={p} groupName={this.payTypesObj[key]}></ir-revenue-row>;
            })}
          </Fragment>
        ) : (
          <p class="text-center my-auto mx-auto">There are no payment transactions recorded for the selected date.</p>
        )}
      </div>
    );
  }
}
