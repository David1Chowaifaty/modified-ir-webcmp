import { Component, Event, EventEmitter, h } from '@stencil/core';
import { SidebarOpenEvent } from '../types';
import moment from 'moment';
import calendar_data from '@/stores/calendar-data';

@Component({
  tag: 'ir-financial-table',
  styleUrls: ['ir-financial-table.css', '../../../common/table.css'],
  scoped: true,
})
export class IrFinancialTable {
  @Event() financialActionsOpenSidebar: EventEmitter<SidebarOpenEvent>;
  render() {
    return (
      <div class="table-container h-100 p-1 m-0 mb-2 table-responsive">
        <table class="table" data-testid="hk_tasks_table">
          <thead class="table-header">
            <tr>
              <th class="text-center">Date</th>
              <th class="text-center">Booking</th>
              <th class="text-center">By direct</th>
              <th class="text-right">Amount</th>
              <th class="text-center"></th>
            </tr>
          </thead>

          <tbody>
            <tr class="ir-table-row">
              <td class="text-center">1</td>
              <td class="text-center">
                <ir-button
                  btn_color="link"
                  size="sm"
                  text="31203720277"
                  onClickHandler={() => {
                    this.financialActionsOpenSidebar.emit({
                      type: 'booking',
                      payload: {
                        bookingNumber: 31203720277,
                      },
                    });
                  }}
                ></ir-button>
              </td>
              <td class="text-center">1</td>
              <td class="text-right">1</td>
              <td>
                <ir-button
                  size="sm"
                  text="Pay"
                  onClickHandler={() => {
                    this.financialActionsOpenSidebar.emit({
                      type: 'payment',
                      payload: {
                        payment: {
                          id: -1,
                          date: moment().format('YYYY-MM-DD'),
                          amount: 120,
                          currency: calendar_data.currency,
                          designation: '',
                          reference: '',
                        },
                        bookingNumber: 31203720277,
                      },
                    });
                  }}
                ></ir-button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }
}
