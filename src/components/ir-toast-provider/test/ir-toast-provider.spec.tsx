import { newSpecPage } from '@stencil/core/testing';
import { IrToastProvider } from '../ir-toast-provider';

describe('ir-toast-provider', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrToastProvider],
      html: `<ir-toast-provider></ir-toast-provider>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-toast-provider>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-toast-provider>
    `);
  });
});
