import { newSpecPage } from '@stencil/core/testing';
import { IrChannelEditor } from '../ir-channel-editor';

describe('ir-channel-editor', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrChannelEditor],
      html: `<ir-channel-editor></ir-channel-editor>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-channel-editor>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-channel-editor>
    `);
  });
});
