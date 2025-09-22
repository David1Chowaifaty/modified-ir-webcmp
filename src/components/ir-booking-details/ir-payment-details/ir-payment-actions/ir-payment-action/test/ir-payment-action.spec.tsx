import { newSpecPage } from '@stencil/core/testing';
import { IrPaymentAction } from '../ir-payment-action';

describe('ir-payment-action', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrPaymentAction],
      html: `<ir-payment-action></ir-payment-action>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-payment-action>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-payment-action>
    `);
  });
});
