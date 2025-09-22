import { newSpecPage } from '@stencil/core/testing';
import { IrDailyRevenue } from '../ir-daily-revenue';

describe('ir-daily-revenue', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrDailyRevenue],
      html: `<ir-daily-revenue></ir-daily-revenue>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-daily-revenue>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-daily-revenue>
    `);
  });
});
