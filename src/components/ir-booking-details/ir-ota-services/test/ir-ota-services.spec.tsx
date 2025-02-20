import { newSpecPage } from '@stencil/core/testing';
import { IrOtaServices } from '../ir-ota-services';

describe('ir-ota-services', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrOtaServices],
      html: `<ir-ota-services></ir-ota-services>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-ota-services>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-ota-services>
    `);
  });
});
