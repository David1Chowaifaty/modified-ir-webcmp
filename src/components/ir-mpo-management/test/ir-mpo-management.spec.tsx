import { newSpecPage } from '@stencil/core/testing';
import { IrMpoManagement } from '../ir-mpo-management';

describe('ir-mpo-management', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrMpoManagement],
      html: `<ir-mpo-management></ir-mpo-management>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-mpo-management>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-mpo-management>
    `);
  });
});
