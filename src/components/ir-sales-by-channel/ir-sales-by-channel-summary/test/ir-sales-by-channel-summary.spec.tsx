import { newSpecPage } from '@stencil/core/testing';
import { IrSalesByChannelSummary } from '../ir-sales-by-channel-summary';

describe('ir-sales-by-channel-summary', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrSalesByChannelSummary],
      html: `<ir-sales-by-channel-summary></ir-sales-by-channel-summary>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-sales-by-channel-summary>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-sales-by-channel-summary>
    `);
  });
});
