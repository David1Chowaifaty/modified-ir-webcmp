import { newSpecPage } from '@stencil/core/testing';
import { IrPaymentItem } from '../ir-payment-item';

describe('ir-payment-item', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrPaymentItem],
      html: `<ir-payment-item></ir-payment-item>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-payment-item>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-payment-item>
    `);
  });
});
