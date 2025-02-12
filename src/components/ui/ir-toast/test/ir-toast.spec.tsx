import { newSpecPage } from '@stencil/core/testing';
import { IrToast } from '../ir-toast';

describe('ir-toast', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrToast],
      html: `<ir-toast></ir-toast>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-toast>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-toast>
    `);
  });
});
