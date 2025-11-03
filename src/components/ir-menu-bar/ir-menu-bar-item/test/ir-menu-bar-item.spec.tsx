import { newSpecPage } from '@stencil/core/testing';
import { IrMenuBarItem } from '../ir-menu-bar-item';

describe('ir-menu-bar-item', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrMenuBarItem],
      html: `<ir-menu-bar-item></ir-menu-bar-item>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-menu-bar-item part="item" role="menuitem" tabindex="-1">
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-menu-bar-item>
    `);
  });
});
