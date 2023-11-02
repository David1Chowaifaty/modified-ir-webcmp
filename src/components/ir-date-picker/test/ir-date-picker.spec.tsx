import { newSpecPage } from '@stencil/core/testing';
import { IrDatePicker } from '../ir-date-picker';

describe('ir-date-picker', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrDatePicker],
      html: `<ir-date-picker></ir-date-picker>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-date-picker>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-date-picker>
    `);
  });
});
