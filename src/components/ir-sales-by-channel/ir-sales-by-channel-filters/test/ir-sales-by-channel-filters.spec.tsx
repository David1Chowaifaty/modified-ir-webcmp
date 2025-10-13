import { newSpecPage } from '@stencil/core/testing';
import { IrSalesByChannelFilters } from '../ir-sales-by-channel-filters';

describe('ir-sales-by-channel-filters', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrSalesByChannelFilters],
      html: `<ir-sales-by-channel-filters></ir-sales-by-channel-filters>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-sales-by-channel-filters>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-sales-by-channel-filters>
    `);
  });
});
