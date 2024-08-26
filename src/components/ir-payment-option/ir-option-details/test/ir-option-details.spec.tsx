import { newSpecPage } from '@stencil/core/testing';
import { IrOptionDetails } from '../ir-option-details';

describe('ir-option-details', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrOptionDetails],
      html: `<ir-option-details></ir-option-details>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-option-details>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-option-details>
    `);
  });
});
