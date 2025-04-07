import { newSpecPage } from '@stencil/core/testing';
import { IrResetPassword } from '../ir-reset-password';

describe('ir-reset-password', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrResetPassword],
      html: `<ir-reset-password></ir-reset-password>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-reset-password>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-reset-password>
    `);
  });
});
