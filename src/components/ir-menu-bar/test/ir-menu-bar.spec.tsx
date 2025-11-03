import { newSpecPage } from '@stencil/core/testing';
import { IrMenuBar } from '../ir-menu-bar';

describe('ir-menu-bar', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrMenuBar],
      html: `<ir-menu-bar></ir-menu-bar>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-menu-bar role="menubar">
        <mock:shadow-root>
          <nav class="menu-bar" part="container">
            <slot></slot>
          </nav>
        </mock:shadow-root>
      </ir-menu-bar>
    `);
  });
});
