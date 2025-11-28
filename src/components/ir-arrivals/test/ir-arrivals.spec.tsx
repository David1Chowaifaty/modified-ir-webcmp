import { newSpecPage } from '@stencil/core/testing';
import { IrArrivals } from '../ir-arrivals';

describe('ir-arrivals', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrArrivals],
      html: `<ir-arrivals></ir-arrivals>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-arrivals>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-arrivals>
    `);
  });
});
