import { newSpecPage } from '@stencil/core/testing';
import { IrNewBadge } from '../ir-new-badge';

describe('ir-new-badge', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrNewBadge],
      html: `<ir-new-badge></ir-new-badge>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-new-badge>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-new-badge>
    `);
  });
});
