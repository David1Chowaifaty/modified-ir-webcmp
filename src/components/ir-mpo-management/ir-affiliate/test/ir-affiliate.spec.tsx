import { newSpecPage } from '@stencil/core/testing';
import { IrAffiliate } from '../ir-affiliate';

describe('ir-affiliate', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrAffiliate],
      html: `<ir-affiliate></ir-affiliate>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-affiliate>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-affiliate>
    `);
  });
});
