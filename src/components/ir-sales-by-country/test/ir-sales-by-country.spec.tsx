import { newSpecPage } from '@stencil/core/testing';
import { IrSalesByCountry } from '../ir-sales-by-country';

describe('ir-sales-by-country', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrSalesByCountry],
      html: `<ir-sales-by-country></ir-sales-by-country>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-sales-by-country>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-sales-by-country>
    `);
  });
});
