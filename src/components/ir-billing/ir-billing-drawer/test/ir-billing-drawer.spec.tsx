import { newSpecPage } from '@stencil/core/testing';
import { IrBillingDrawer } from '../ir-billing-drawer';

describe('ir-billing-drawer', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrBillingDrawer],
      html: `<ir-billing-drawer></ir-billing-drawer>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-billing-drawer>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-billing-drawer>
    `);
  });
});
