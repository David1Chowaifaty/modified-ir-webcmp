import { newSpecPage } from '@stencil/core/testing';
import { IrInteractiveTitle } from '../ir-interactive-title';

describe('ir-interactive-title', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrInteractiveTitle],
      html: `<ir-interactive-title></ir-interactive-title>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-interactive-title>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-interactive-title>
    `);
  });
});
