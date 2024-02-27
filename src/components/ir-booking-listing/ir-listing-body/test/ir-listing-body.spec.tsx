import { newSpecPage } from '@stencil/core/testing';
import { IrListingBody } from '../ir-listing-body';

describe('ir-listing-body', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrListingBody],
      html: `<ir-listing-body></ir-listing-body>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-listing-body>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-listing-body>
    `);
  });
});
