import { newSpecPage } from '@stencil/core/testing';
import { IrTitle } from '../ir-title';

describe('ir-title', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrTitle],
      html: `<ir-title></ir-title>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-title>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-title>
    `);
  });
});
