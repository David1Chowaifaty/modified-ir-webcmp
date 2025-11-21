import { newSpecPage } from '@stencil/core/testing';
import { IrCustomButton } from '../ir-custom-button';

describe('ir-custom-button', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrCustomButton],
      html: `<ir-custom-button></ir-custom-button>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-custom-button>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-custom-button>
    `);
  });
});
