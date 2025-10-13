import { newSpecPage } from '@stencil/core/testing';
import { IrSalesByChannel } from '../ir-sales-by-channel';

describe('ir-sales-by-channel', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrSalesByChannel],
      html: `<ir-sales-by-channel></ir-sales-by-channel>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-sales-by-channel>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-sales-by-channel>
    `);
  });
});
