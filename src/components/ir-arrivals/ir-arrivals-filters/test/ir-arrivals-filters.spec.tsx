import { newSpecPage } from '@stencil/core/testing';
import { IrArrivalsFilters } from '../ir-arrivals-filters';

describe('ir-arrivals-filters', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrArrivalsFilters],
      html: `<ir-arrivals-filters></ir-arrivals-filters>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-arrivals-filters>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-arrivals-filters>
    `);
  });
});
