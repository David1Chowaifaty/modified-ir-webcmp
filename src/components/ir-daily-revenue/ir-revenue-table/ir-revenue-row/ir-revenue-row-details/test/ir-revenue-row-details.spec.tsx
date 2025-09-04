import { newSpecPage } from '@stencil/core/testing';
import { IrRevenueRowDetails } from '../ir-revenue-row-details';

describe('ir-revenue-row-details', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrRevenueRowDetails],
      html: `<ir-revenue-row-details></ir-revenue-row-details>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-revenue-row-details>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-revenue-row-details>
    `);
  });
});
