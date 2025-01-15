import { newSpecPage } from '@stencil/core/testing';
import { IrCountryPicker } from '../ir-country-picker';

describe('ir-country-picker', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrCountryPicker],
      html: `<ir-country-picker></ir-country-picker>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-country-picker>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-country-picker>
    `);
  });
});
