import { newSpecPage } from '@stencil/core/testing';
import { IrGuestInfoForm } from '../ir-guest-info-form';

describe('ir-guest-info-form', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrGuestInfoForm],
      html: `<ir-guest-info-form></ir-guest-info-form>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-guest-info-form>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-guest-info-form>
    `);
  });
});
