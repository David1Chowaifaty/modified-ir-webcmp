import { newSpecPage } from '@stencil/core/testing';
import { IrReportStatsCard } from '../ir-report-stats-card';

describe('ir-report-stats-card', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrReportStatsCard],
      html: `<ir-report-stats-card></ir-report-stats-card>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-report-stats-card>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-report-stats-card>
    `);
  });
});
