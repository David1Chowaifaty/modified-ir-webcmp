import { Component, Host, h } from '@stencil/core';

@Component({
  tag: 'ir-marketplace',
  styleUrls: ['ir-marketplace.css', '../../../common/table.css'],
  scoped: true,
})
export class IrMarketplace {
  render() {
    return (
      <Host>
        <table class="table">
          <thead>
            <tr>
              <th>Country</th>
              <th>Marketplace</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr class={'ir-table-row'}>
              <td colSpan={3} class="text-center">
                No data
              </td>
            </tr>
          </tbody>
        </table>
      </Host>
    );
  }
}
