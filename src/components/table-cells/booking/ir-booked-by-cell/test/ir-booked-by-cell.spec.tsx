import { newSpecPage } from '@stencil/core/testing';
import { IrBookedByCell } from '../ir-booked-by-cell';

describe('ir-booked-by-source-cell', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrBookedByCell],
      html: `<ir-booked-by-cell></ir-booked-by-cell>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-booked-by-cell>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-booked-by-cell>
    `);
  });
});
