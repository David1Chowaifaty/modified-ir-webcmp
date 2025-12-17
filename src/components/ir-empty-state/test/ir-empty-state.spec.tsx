import { newSpecPage } from '@stencil/core/testing';
import { IrEmptyState } from '../ir-empty-state';

describe('ir-empty-state', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrEmptyState],
      html: `<ir-empty-state></ir-empty-state>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-empty-state>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-empty-state>
    `);
  });
});
