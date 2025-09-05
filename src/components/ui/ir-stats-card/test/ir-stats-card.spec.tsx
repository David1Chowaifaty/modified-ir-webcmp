import { newSpecPage } from '@stencil/core/testing';
import { IrStatsCard } from '../ir-stats-card';

describe('ir-stats-card', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrStatsCard],
      html: `<ir-stats-card></ir-stats-card>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-stats-card>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-stats-card>
    `);
  });
});
