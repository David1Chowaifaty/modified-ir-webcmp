import { newSpecPage } from '@stencil/core/testing';
import { IrImagePreview } from '../ir-image-preview';

describe('ir-image-preview', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrImagePreview],
      html: `<ir-image-preview></ir-image-preview>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-image-preview>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-image-preview>
    `);
  });
});
