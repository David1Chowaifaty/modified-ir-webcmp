import { newSpecPage } from '@stencil/core/testing';
import { IrMenu } from '../ir-menu';

describe('ir-menu', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrMenu],
      html: `<ir-menu></ir-menu>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-menu>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-menu>
    `);
  });
});
