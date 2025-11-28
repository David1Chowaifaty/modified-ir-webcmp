import { newSpecPage } from '@stencil/core/testing';
import { IrGuestNameCell } from '../ir-guest-name-cell';

describe('ir-guest-name-cell', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrGuestNameCell],
      html: `<ir-guest-name-cell></ir-guest-name-cell>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-guest-name-cell>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-guest-name-cell>
    `);
  });
});
