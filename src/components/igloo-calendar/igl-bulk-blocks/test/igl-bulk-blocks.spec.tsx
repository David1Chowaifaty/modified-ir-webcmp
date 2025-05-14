import { newSpecPage } from '@stencil/core/testing';
import { IglBulkBlocks } from '../igl-bulk-blocks';

describe('igl-bulk-blocks', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IglBulkBlocks],
      html: `<igl-bulk-blocks></igl-bulk-blocks>`,
    });
    expect(page.root).toEqualHtml(`
      <igl-bulk-blocks>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </igl-bulk-blocks>
    `);
  });
});
