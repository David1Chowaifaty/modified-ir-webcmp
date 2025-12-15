import { newSpecPage } from '@stencil/core/testing';
import { IrPrintingExtraService } from '../ir-printing-extra-service';

describe('ir-printing-extra-service', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrPrintingExtraService],
      html: `<ir-printing-extra-service></ir-printing-extra-service>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-printing-extra-service>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-printing-extra-service>
    `);
  });
});
