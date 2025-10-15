import { newSpecPage } from '@stencil/core/testing';
import { IglSplitBooking } from '../igl-split-booking';

describe('igl-split-booking', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IglSplitBooking],
      html: `<igl-split-booking></igl-split-booking>`,
    });
    expect(page.root).toEqualHtml(`
      <igl-split-booking>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </igl-split-booking>
    `);
  });
});
