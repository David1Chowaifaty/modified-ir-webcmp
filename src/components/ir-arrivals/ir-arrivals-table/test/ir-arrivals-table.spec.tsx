import { newSpecPage } from '@stencil/core/testing';
import { IrArrivalsTable } from '../ir-arrivals-table';

describe('ir-arrivals-table', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrArrivalsTable],
      html: `<ir-arrivals-table></ir-arrivals-table>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-arrivals-table>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-arrivals-table>
    `);
  });
});
