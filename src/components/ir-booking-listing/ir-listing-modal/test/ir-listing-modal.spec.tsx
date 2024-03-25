import { newSpecPage } from '@stencil/core/testing';
import { IrListingModal } from '../ir-listing-modal';

describe('ir-listing-modal', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrListingModal],
      html: `<ir-listing-modal></ir-listing-modal>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-listing-modal>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-listing-modal>
    `);
  });
});
