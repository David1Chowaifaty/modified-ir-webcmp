import { newSpecPage } from '@stencil/core/testing';
import { IrMpoCoreDetails } from '../ir-mpo-core-details';

describe('ir-mpo-core-details', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrMpoCoreDetails],
      html: `<ir-mpo-core-details></ir-mpo-core-details>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-mpo-core-details>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-mpo-core-details>
    `);
  });
});
