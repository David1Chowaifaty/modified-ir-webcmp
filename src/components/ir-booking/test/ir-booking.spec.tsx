import { newSpecPage } from '@stencil/core/testing';
import { IrBooking } from '../ir-booking';

describe('ir-booking', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrBooking],
      html: `<ir-booking></ir-booking>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-booking>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-booking>
    `);
  });
});
