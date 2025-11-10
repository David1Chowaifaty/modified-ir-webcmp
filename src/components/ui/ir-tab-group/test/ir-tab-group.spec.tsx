import { newSpecPage } from '@stencil/core/testing';
import { IrTabGroup } from '../ir-tab-group';

describe('ir-tab-group', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrTabGroup],
      html: `<ir-tab-group></ir-tab-group>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-tab-group>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-tab-group>
    `);
  });
});
