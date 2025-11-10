import { newSpecPage } from '@stencil/core/testing';
import { IrMarketplace } from '../ir-marketplace';

describe('ir-marketplace', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrMarketplace],
      html: `<ir-marketplace></ir-marketplace>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-marketplace>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-marketplace>
    `);
  });
});
