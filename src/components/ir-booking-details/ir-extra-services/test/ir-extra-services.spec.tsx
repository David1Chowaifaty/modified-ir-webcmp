import { newSpecPage } from '@stencil/core/testing';
import { IrExtraServices } from '../ir-extra-services';

describe('ir-extra-services', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrExtraServices],
      html: `<ir-extra-services></ir-extra-services>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-extra-services>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-extra-services>
    `);
  });
});
