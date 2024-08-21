import { newSpecPage } from '@stencil/core/testing';
import { IrLogin } from '../ir-login';

describe('ir-login', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrLogin],
      html: `<ir-login></ir-login>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-login>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-login>
    `);
  });
});
