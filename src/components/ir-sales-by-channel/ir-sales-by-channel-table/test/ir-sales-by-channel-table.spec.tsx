import { newSpecPage } from '@stencil/core/testing';
import { IrSalesByChannelTable } from '../ir-sales-by-channel-table';

describe('ir-sales-by-channel-table', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrSalesByChannelTable],
      html: `<ir-sales-by-channel-table></ir-sales-by-channel-table>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-sales-by-channel-table>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-sales-by-channel-table>
    `);
  });
});
