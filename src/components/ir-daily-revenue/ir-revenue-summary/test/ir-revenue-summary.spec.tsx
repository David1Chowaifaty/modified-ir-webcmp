import { newSpecPage } from '@stencil/core/testing';
import { IrRevenueSummary } from '../ir-revenue-summary';

describe('ir-revenue-summary', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrRevenueSummary],
      html: `<ir-revenue-summary></ir-revenue-summary>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-revenue-summary>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-revenue-summary>
    `);
  });
});
