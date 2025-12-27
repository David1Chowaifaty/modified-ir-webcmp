import { newSpecPage } from '@stencil/core/testing';
import { IrMenuItem } from '../ir-menu-item';

describe('ir-menu-item', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrMenuItem],
      html: `<ir-menu-item></ir-menu-item>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-menu-item>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-menu-item>
    `);
  });
});
