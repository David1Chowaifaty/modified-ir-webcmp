import { newSpecPage } from '@stencil/core/testing';
import { IrListingHeader } from '../ir-listing-header';

describe('ir-listing-header', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrListingHeader],
      html: `<ir-listing-header></ir-listing-header>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-listing-header>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-listing-header>
    `);
  });
});
