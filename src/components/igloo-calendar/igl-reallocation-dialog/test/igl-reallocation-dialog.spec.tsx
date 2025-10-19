import { newSpecPage } from '@stencil/core/testing';
import { IglReallocationDialog } from '../igl-reallocation-dialog';

describe('igl-reallocation-dialog', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IglReallocationDialog],
      html: `<igl-reallocation-dialog></igl-reallocation-dialog>`,
    });
    expect(page.root).toEqualHtml(`
      <igl-reallocation-dialog>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </igl-reallocation-dialog>
    `);
  });
});
