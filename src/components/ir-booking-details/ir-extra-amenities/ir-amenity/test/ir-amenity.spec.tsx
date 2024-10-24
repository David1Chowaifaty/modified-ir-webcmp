import { newSpecPage } from '@stencil/core/testing';
import { IrAmenity } from '../ir-amenity';

describe('ir-amenity', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrAmenity],
      html: `<ir-amenity></ir-amenity>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-amenity>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-amenity>
    `);
  });
});
