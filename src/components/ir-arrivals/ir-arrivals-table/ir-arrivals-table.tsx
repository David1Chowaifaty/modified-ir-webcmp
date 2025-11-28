import { Component, Host, h } from '@stencil/core';

@Component({
  tag: 'ir-arrivals-table',
  styleUrls: ['ir-arrivals-table.css', '../../../common/table.css'],
  scoped: true,
})
export class IrArrivalsTable {
  render() {
    return (
      <Host>
        <table class="table">
          <thead>
            <tr>
              <th>Booking#</th>
              <th>
                <div>
                  <p>Booked by/ </p>
                  <p>Source</p>
                </div>
              </th>
              <th>Guest name</th>
              <th>Unit</th>
              <th>Dates</th>
              <th>Balance</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr class="ir-table-row">
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
            </tr>
          </tbody>
        </table>
      </Host>
    );
  }
}
