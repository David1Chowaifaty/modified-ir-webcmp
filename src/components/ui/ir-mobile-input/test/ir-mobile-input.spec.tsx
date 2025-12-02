import { newSpecPage } from '@stencil/core/testing';
import { IrMobileInput } from '../ir-mobile-input';

describe('ir-mobile-input', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrMobileInput],
      html: `<ir-mobile-input></ir-mobile-input>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-mobile-input>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-mobile-input>
    `);
  });
});
