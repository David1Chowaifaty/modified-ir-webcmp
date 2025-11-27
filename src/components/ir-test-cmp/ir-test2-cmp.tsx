import { Component, Host, State, h } from '@stencil/core';
import { booking } from './_data';

@Component({
  tag: 'ir-test2-cmp',
  styleUrl: 'ir-test-cmp.css',
  scoped: true,
})
export class IrTest2Cmp {
  invoiceRef: HTMLIrInvoiceElement;

  render() {
    return (
      <Host style={{ background: 'white' }}>
        <ir-custom-button onClickHandler={() => this.invoiceRef.openDrawer()}>open</ir-custom-button>
        <ir-invoice ref={el => (this.invoiceRef = el)} booking={booking as any}></ir-invoice>
      </Host>
    );
  }
}
