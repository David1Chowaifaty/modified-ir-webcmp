import { newSpecPage } from '@stencil/core/testing';
import { IrAmenitiesConfig } from '../ir-amenities-config';

describe('ir-amenities-config', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrAmenitiesConfig],
      html: `<ir-amenities-config></ir-amenities-config>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-amenities-config>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-amenities-config>
    `);
  });
});
