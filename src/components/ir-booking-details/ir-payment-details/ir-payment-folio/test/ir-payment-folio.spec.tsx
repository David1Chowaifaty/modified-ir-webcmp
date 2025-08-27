import { newSpecPage } from '@stencil/core/testing';
import { IrPaymentFolio } from '../ir-payment-folio';

describe('ir-payment-folio', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrPaymentFolio],
      html: `<ir-payment-folio></ir-payment-folio>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-payment-folio>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-payment-folio>
    `);
  });
});
