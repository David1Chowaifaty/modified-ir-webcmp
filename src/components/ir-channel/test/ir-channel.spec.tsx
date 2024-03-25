import { newSpecPage } from '@stencil/core/testing';
import { IrChannel } from '../ir-channel';

describe('ir-channel', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrChannel],
      html: `<ir-channel></ir-channel>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-channel>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-channel>
    `);
  });
});
