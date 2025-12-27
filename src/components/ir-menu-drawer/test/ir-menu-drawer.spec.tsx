import { newSpecPage } from '@stencil/core/testing';
import { IrMenuDrawer } from '../ir-menu-drawer';

describe('ir-menu-drawer', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrMenuDrawer],
      html: `<ir-menu-drawer></ir-menu-drawer>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-menu-drawer>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-menu-drawer>
    `);
  });
});
