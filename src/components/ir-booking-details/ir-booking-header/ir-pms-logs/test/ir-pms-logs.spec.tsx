import { newSpecPage } from '@stencil/core/testing';
import { IrPmsLogs } from '../ir-pms-logs';

describe('ir-pms-logs', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrPmsLogs],
      html: `<ir-pms-logs></ir-pms-logs>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-pms-logs>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-pms-logs>
    `);
  });
});
