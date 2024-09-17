import { newSpecPage } from '@stencil/core/testing';
import { IrPickupView } from '../ir-pickup-view';

describe('ir-pickup-view', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrPickupView],
      html: `<ir-pickup-view></ir-pickup-view>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-pickup-view>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-pickup-view>
    `);
  });
});
