import { newSpecPage } from '@stencil/core/testing';
import { IrCheckoutDialog } from '../ir-checkout-dialog';

describe('ir-checkout-dialog', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrCheckoutDialog],
      html: `<ir-checkout-dialog></ir-checkout-dialog>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-checkout-dialog>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-checkout-dialog>
    `);
  });
});
