import { newSpecPage } from '@stencil/core/testing';
import { IrChannelGeneral } from '../ir-channel-general';

describe('ir-channel-general', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrChannelGeneral],
      html: `<ir-channel-general></ir-channel-general>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-channel-general>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-channel-general>
    `);
  });
});
