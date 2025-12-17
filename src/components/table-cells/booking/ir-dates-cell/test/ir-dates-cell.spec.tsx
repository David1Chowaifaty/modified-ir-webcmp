import { newSpecPage } from '@stencil/core/testing';
import { IrDatesCell } from '../ir-dates-cell';

describe('ir-dates-cell', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrDatesCell],
      html: `<ir-dates-cell></ir-dates-cell>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-dates-cell>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-dates-cell>
    `);
  });
});
