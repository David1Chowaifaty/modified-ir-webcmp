import { newSpecPage } from '@stencil/core/testing';
import { IrChannelHeader } from '../ir-channel-header';

describe('ir-channel-header', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrChannelHeader],
      html: `<ir-channel-header></ir-channel-header>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-channel-header>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-channel-header>
    `);
  });
});
