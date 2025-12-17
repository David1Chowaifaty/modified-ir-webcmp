import { newSpecPage } from '@stencil/core/testing';
import { IrPickupForm } from '../ir-pickup-form';

describe('ir-pickup-form', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrPickupForm],
      html: `<ir-pickup-form></ir-pickup-form>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-pickup-form>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-pickup-form>
    `);
  });
});
