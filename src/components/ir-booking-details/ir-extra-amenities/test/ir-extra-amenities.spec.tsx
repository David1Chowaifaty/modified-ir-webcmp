import { newSpecPage } from '@stencil/core/testing';
import { IrExtraAmenities } from '../ir-extra-amenities';

describe('ir-extra-amenities', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrExtraAmenities],
      html: `<ir-extra-amenities></ir-extra-amenities>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-extra-amenities>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-extra-amenities>
    `);
  });
});
