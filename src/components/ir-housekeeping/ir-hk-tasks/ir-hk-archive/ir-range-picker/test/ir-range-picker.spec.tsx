import { newSpecPage } from '@stencil/core/testing';
import { IrRangePicker } from '../ir-range-picker';

describe('ir-range-picker', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrRangePicker],
      html: `<ir-range-picker></ir-range-picker>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-range-picker>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-range-picker>
    `);
  });
});
