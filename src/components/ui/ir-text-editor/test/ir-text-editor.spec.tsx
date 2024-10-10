import { newSpecPage } from '@stencil/core/testing';
import { IrTextEditor } from '../ir-text-editor';

describe('ir-text-editor', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrTextEditor],
      html: `<ir-text-editor></ir-text-editor>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-text-editor>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-text-editor>
    `);
  });
});
