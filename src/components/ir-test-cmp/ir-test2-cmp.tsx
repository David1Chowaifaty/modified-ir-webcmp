import { Component, Host, h } from '@stencil/core';
import { booking } from './_data';

@Component({
  tag: 'ir-test2-cmp',
  styleUrls: ['ir-test-cmp.css', '../../common/table.css'],
  scoped: true,
})
export class IrTest2Cmp {
  invoiceRef: HTMLIrInvoiceElement;

  render() {
    return (
      <Host style={{ background: 'white' }}>
        <ir-custom-button onClickHandler={() => this.invoiceRef.openDrawer()}>open</ir-custom-button>
        <ir-invoice ref={el => (this.invoiceRef = el)} booking={booking as any}></ir-invoice>
        <div style={{ background: 'white' }}>
          <table class="table ir-table ir-zebra-rows ir-hover-rows">
            <caption>
              This
              <code>&lt;caption&gt;</code>
              describes the table
            </caption>
            <thead>
              <tr>
                <th>First column</th>
                <th>Second column</th>
                <th>Third column</th>
                <th>Final column</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Data</td>
                <td>Data</td>
                <td>Data</td>
                <td>Data</td>
              </tr>
              <tr>
                <td>Data</td>
                <td>Data</td>
                <td>Data</td>
                <td>Data</td>
              </tr>
              <tr>
                <td>Data</td>
                <td>Data</td>
                <td>Data</td>
                <td>Data</td>
              </tr>
              <tr>
                <td>Data</td>
                <td>Data</td>
                <td>Data</td>
                <td>Data</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Host>
    );
  }
}
