import { newSpecPage } from '@stencil/core/testing';
import { IrAccordion } from '../ir-accordion';

describe('ir-accordion', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrAccordion],
      html: `<ir-accordion></ir-accordion>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-accordion>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-accordion>
    `);
  });
});
