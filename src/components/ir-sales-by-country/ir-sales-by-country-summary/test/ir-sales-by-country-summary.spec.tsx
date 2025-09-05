import { newSpecPage } from '@stencil/core/testing';
import { IrSalesByCountrySummary } from '../ir-sales-by-country-summary';

describe('ir-sales-by-country-summary', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrSalesByCountrySummary],
      html: `<ir-sales-by-country-summary></ir-sales-by-country-summary>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-sales-by-country-summary>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-sales-by-country-summary>
    `);
  });
});
