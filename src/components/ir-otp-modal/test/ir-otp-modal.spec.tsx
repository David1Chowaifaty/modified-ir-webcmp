import { newSpecPage } from '@stencil/core/testing';
import { IrOtpModal } from '../ir-otp-modal';

describe('ir-otp-modal', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrOtpModal],
      html: `<ir-otp-modal></ir-otp-modal>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-otp-modal>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-otp-modal>
    `);
  });
});
