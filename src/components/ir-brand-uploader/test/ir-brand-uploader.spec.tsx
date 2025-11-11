import { newSpecPage } from '@stencil/core/testing';
import { IrBrandUploader } from '../ir-brand-uploader';

describe('ir-brand-uploader', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrBrandUploader],
      html: `<ir-brand-uploader></ir-brand-uploader>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-brand-uploader>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-brand-uploader>
    `);
  });
});
