import { newSpecPage } from '@stencil/core/testing';
import { IrCopyButton } from '../ir-copy-button';

describe('ir-copy-button', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrCopyButton],
      html: `<ir-copy-button></ir-copy-button>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-copy-button>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-copy-button>
    `);
  });
});
