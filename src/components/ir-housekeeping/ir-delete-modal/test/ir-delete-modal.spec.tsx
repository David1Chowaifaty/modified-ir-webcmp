import { newSpecPage } from '@stencil/core/testing';
import { IrDeleteModal } from '../ir-delete-modal';

describe('ir-delete-modal', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrDeleteModal],
      html: `<ir-delete-modal></ir-delete-modal>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-delete-modal>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-delete-modal>
    `);
  });
});
