import { newSpecPage } from '@stencil/core/testing';
import { IrWeekdaySelector } from '../ir-weekday-selector';

describe('ir-weekday-selector', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrWeekdaySelector],
      html: `<ir-weekday-selector></ir-weekday-selector>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-weekday-selector>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-weekday-selector>
    `);
  });
});
