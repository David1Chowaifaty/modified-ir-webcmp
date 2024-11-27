import { newSpecPage } from '@stencil/core/testing';
import { IrExtraService } from '../ir-extra-service';

describe('ir-extra-service', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrExtraService],
      html: `<ir-extra-service></ir-extra-service>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-extra-service>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-extra-service>
    `);
  });
});
