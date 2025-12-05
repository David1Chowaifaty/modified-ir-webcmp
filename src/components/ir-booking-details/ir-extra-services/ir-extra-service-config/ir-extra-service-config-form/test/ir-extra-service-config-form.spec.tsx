import { newSpecPage } from '@stencil/core/testing';
import { IrExtraServiceConfigForm } from '../ir-extra-service-config-form';

describe('ir-extra-service-config-form', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrExtraServiceConfigForm],
      html: `<ir-extra-service-config-form></ir-extra-service-config-form>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-extra-service-config-form>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-extra-service-config-form>
    `);
  });
});
