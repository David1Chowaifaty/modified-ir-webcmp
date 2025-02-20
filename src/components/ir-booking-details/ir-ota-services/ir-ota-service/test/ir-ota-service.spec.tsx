import { newSpecPage } from '@stencil/core/testing';
import { IrOtaService } from '../ir-ota-service';

describe('ir-ota-service', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrOtaService],
      html: `<ir-ota-service></ir-ota-service>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-ota-service>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-ota-service>
    `);
  });
});
