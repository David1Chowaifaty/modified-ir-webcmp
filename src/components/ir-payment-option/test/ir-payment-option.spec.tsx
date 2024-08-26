import { newSpecPage } from '@stencil/core/testing';
import { IrPaymentOption } from '../ir-payment-option';

describe('ir-payment-option', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrPaymentOption],
      html: `<ir-payment-option></ir-payment-option>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-payment-option>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-payment-option>
    `);
  });
});
