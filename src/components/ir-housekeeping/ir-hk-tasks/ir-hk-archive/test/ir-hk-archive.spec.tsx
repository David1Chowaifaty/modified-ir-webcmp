import { newSpecPage } from '@stencil/core/testing';
import { IrHkArchive } from '../ir-hk-archive';

describe('ir-hk-archive', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrHkArchive],
      html: `<ir-hk-archive></ir-hk-archive>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-hk-archive>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-hk-archive>
    `);
  });
});
