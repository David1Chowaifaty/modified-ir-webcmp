import { newSpecPage } from '@stencil/core/testing';
import { IrStatusActivityCell } from '../ir-status-activity-cell';

describe('ir-status-activity-cell', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrStatusActivityCell],
      html: `<ir-status-activity-cell></ir-status-activity-cell>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-status-activity-cell>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-status-activity-cell>
    `);
  });
});
