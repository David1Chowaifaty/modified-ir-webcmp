import { newSpecPage } from '@stencil/core/testing';
import { IrHousekeeping } from '../ir-housekeeping';

describe('ir-housekeeping', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrHousekeeping],
      html: `<ir-housekeeping></ir-housekeeping>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-housekeeping>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-housekeeping>
    `);
  });
});
