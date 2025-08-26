import { newSpecPage } from '@stencil/core/testing';
import { IrPaymentsFolio } from '../ir-payments-folio';

describe('ir-payments-folio', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrPaymentsFolio],
      html: `<ir-payments-folio></ir-payments-folio>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-payments-folio>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-payments-folio>
    `);
  });
});
