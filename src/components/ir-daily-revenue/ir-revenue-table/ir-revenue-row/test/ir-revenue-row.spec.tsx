import { newSpecPage } from '@stencil/core/testing';
import { IrRevenueRow } from '../ir-revenue-row';

describe('ir-revenue-row', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrRevenueRow],
      html: `<ir-revenue-row></ir-revenue-row>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-revenue-row>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-revenue-row>
    `);
  });
});
