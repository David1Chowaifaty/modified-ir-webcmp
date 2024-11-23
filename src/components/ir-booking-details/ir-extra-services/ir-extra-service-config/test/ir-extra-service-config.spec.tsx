import { newSpecPage } from '@stencil/core/testing';
import { IrExtraServiceConfig } from '../ir-extra-service-config';

describe('ir-extra-service-config', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrExtraServiceConfig],
      html: `<ir-extra-service-config></ir-extra-service-config>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-extra-service-config>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-extra-service-config>
    `);
  });
});
