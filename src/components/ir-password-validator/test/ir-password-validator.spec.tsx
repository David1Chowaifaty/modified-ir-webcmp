import { newSpecPage } from '@stencil/core/testing';
import { IrPasswordValidator } from '../ir-password-validator';

describe('ir-password-validator', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrPasswordValidator],
      html: `<ir-password-validator></ir-password-validator>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-password-validator>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-password-validator>
    `);
  });
});
