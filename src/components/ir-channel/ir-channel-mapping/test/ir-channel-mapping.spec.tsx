import { newSpecPage } from '@stencil/core/testing';
import { IrChannelMapping } from '../ir-channel-mapping';

describe('ir-channel-mapping', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrChannelMapping],
      html: `<ir-channel-mapping></ir-channel-mapping>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-channel-mapping>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-channel-mapping>
    `);
  });
});
