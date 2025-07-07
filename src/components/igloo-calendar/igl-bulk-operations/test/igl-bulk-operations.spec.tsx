import { newSpecPage } from '@stencil/core/testing';
import { IglBulkOperations } from '../igl-bulk-operations';

describe('igl-bulk-operations', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IglBulkOperations],
      html: `<igl-bulk-operations></igl-bulk-operations>`,
    });
    expect(page.root).toEqualHtml(`
      <igl-bulk-operations>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </igl-bulk-operations>
    `);
  });
});
