import { newSpecPage } from '@stencil/core/testing';
import { IrBilling } from '../ir-billing';

describe('ir-billing', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrBilling],
      html: `<ir-billing></ir-billing>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-billing>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-billing>
    `);
  });
});
