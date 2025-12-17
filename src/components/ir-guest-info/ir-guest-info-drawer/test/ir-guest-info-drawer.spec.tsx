import { newSpecPage } from '@stencil/core/testing';
import { IrGuestInfoDrawer } from '../ir-guest-info-drawer';

describe('ir-guest-info-drawer', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrGuestInfoDrawer],
      html: `<ir-guest-info-drawer></ir-guest-info-drawer>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-guest-info-drawer>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-guest-info-drawer>
    `);
  });
});
