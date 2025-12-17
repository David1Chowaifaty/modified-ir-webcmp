import { newSpecPage } from '@stencil/core/testing';
import { IrPaymentFolioForm } from '../ir-payment-folio-form';

describe('ir-payment-folio-form', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrPaymentFolioForm],
      html: `<ir-payment-folio-form></ir-payment-folio-form>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-payment-folio-form>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-payment-folio-form>
    `);
  });
});
