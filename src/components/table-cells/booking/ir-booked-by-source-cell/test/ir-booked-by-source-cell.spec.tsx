import { newSpecPage } from '@stencil/core/testing';
import { IrBookedBySourceCell } from '../ir-booked-by-source-cell';

describe('ir-booked-by-source-cell', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrBookedBySourceCell],
      html: `<ir-booked-by-source-cell></ir-booked-by-source-cell>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-booked-by-source-cell>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-booked-by-source-cell>
    `);
  });
});
