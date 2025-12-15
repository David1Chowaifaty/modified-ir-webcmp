import { newSpecPage } from '@stencil/core/testing';
import { IrPrintingLabel } from '../ir-printing-label';

describe('ir-printing-label', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrPrintingLabel],
      html: `<ir-printing-label></ir-printing-label>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-printing-label>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-printing-label>
    `);
  });
});
