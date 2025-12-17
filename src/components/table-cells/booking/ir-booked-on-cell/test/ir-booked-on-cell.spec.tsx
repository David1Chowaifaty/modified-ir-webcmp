import { newSpecPage } from '@stencil/core/testing';
import { IrBookedOnCell } from '../ir-booked-on-cell';

describe('ir-booked-on-cell', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrBookedOnCell],
      html: `<ir-booked-on-cell></ir-booked-on-cell>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-booked-on-cell>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-booked-on-cell>
    `);
  });
});
