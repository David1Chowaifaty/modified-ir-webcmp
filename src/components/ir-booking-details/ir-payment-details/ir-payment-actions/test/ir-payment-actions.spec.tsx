import { newSpecPage } from '@stencil/core/testing';
import { IrPaymentActions } from '../ir-payment-actions';

describe('ir-payment-actions', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrPaymentActions],
      html: `<ir-payment-actions></ir-payment-actions>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-payment-actions>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-payment-actions>
    `);
  });
});
