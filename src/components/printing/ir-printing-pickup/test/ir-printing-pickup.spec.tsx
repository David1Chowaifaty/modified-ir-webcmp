import { newSpecPage } from '@stencil/core/testing';
import { IrPrintingPickup } from '../ir-printing-pickup';

describe('ir-printing-pickup', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrPrintingPickup],
      html: `<ir-printing-pickup></ir-printing-pickup>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-printing-pickup>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-printing-pickup>
    `);
  });
});
