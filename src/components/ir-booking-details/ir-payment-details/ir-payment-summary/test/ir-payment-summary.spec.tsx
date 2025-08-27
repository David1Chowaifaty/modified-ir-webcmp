import { newSpecPage } from '@stencil/core/testing';
import { IrPaymentSummary } from '../ir-payment-summary';

describe('ir-payment-summary', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrPaymentSummary],
      html: `<ir-payment-summary></ir-payment-summary>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-payment-summary>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-payment-summary>
    `);
  });
});
