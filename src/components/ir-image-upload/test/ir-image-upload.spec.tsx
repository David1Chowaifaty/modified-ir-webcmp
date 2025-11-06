import { newSpecPage } from '@stencil/core/testing';
import { IrImageUpload } from '../ir-image-upload';

describe('ir-image-upload', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrImageUpload],
      html: `<ir-image-upload></ir-image-upload>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-image-upload>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-image-upload>
    `);
  });
});
