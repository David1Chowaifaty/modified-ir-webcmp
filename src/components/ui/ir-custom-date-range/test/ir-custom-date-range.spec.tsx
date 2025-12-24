import { newSpecPage } from '@stencil/core/testing';
import { IrCustomDateRange } from '../ir-custom-date-range';

describe('ir-date-range', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrCustomDateRange],
      html: `<ir-custom-date-range></ir-custom-date-range>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-custom-date-range>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-custom-date-range>
    `);
  });
});
