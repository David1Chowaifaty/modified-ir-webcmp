import { newSpecPage } from '@stencil/core/testing';
import { IrLoadingScreen } from '../ir-loading-screen';

describe('ir-loading-screen', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrLoadingScreen],
      html: `<ir-loading-screen></ir-loading-screen>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-loading-screen>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-loading-screen>
    `);
  });
});
