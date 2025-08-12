import { newSpecPage } from '@stencil/core/testing';
import { IglBulkBlock } from '../igl-bulk-block';

describe('igl-bulk-block', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IglBulkBlock],
      html: `<igl-bulk-block></igl-bulk-block>`,
    });
    expect(page.root).toEqualHtml(`
      <igl-bulk-block>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </igl-bulk-block>
    `);
  });
});
