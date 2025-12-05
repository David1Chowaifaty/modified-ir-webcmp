import { newSpecPage } from '@stencil/core/testing';
import { IrInvoiceForm } from '../ir-invoice-form';

describe('ir-invoice-form', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrInvoiceForm],
      html: `<ir-invoice-form></ir-invoice-form>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-invoice-form>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-invoice-form>
    `);
  });
});
