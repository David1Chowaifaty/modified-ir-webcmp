import { newSpecPage } from '@stencil/core/testing';
import { IrMenuGroup } from '../ir-menu-group';

describe('ir-menu-group', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrMenuGroup],
      html: `<ir-menu-group></ir-menu-group>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-menu-group>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-menu-group>
    `);
  });
});
