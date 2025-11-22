import { newSpecPage } from '@stencil/core/testing';
import { IrCustomDatePicker } from '../ir-custom-date-picker';

describe('ir-custom-date-picker', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrCustomDatePicker],
      html: `<ir-custom-date-picker></ir-custom-date-picker>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-custom-date-picker>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-custom-date-picker>
    `);
  });
});
