import { newSpecPage } from '@stencil/core/testing';
import { IrActionsCell } from '../ir-actions-cell';

describe('ir-actions-cell', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrActionsCell],
      html: `<ir-actions-cell></ir-actions-cell>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-actions-cell>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-actions-cell>
    `);
  });
});
