import { newSpecPage } from '@stencil/core/testing';
import { IrPopover } from '../ir-popover';

describe('ir-popover', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrPopover],
      html: `<ir-popover></ir-popover>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-popover>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-popover>
    `);
  });
});
