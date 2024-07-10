import { newSpecPage } from '@stencil/core/testing';
import { IrHkUser } from '../ir-hk-user';

describe('ir-hk-user', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrHkUser],
      html: `<ir-hk-user></ir-hk-user>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-hk-user>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-hk-user>
    `);
  });
});
