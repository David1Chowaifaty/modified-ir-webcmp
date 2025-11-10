import { newSpecPage } from '@stencil/core/testing';
import { IrImageGallery } from '../ir-image-gallery';

describe('ir-image-gallery', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrImageGallery],
      html: `<ir-image-gallery></ir-image-gallery>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-image-gallery>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-image-gallery>
    `);
  });
});
