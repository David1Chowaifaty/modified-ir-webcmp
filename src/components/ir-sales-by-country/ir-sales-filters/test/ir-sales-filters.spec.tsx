import { newSpecPage } from '@stencil/core/testing';
import { IrSalesFilters } from '../ir-sales-filters';

describe('ir-sales-filters', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrSalesFilters],
      html: `<ir-sales-filters></ir-sales-filters>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-sales-filters>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-sales-filters>
    `);
  });
});
