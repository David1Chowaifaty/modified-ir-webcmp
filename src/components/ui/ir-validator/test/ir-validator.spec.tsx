import { newSpecPage } from '@stencil/core/testing';
import { IrValidator } from '../ir-validator';

describe('ir-validator', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrValidator],
      html: `<ir-validator></ir-validator>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-validator>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-validator>
    `);
  });
});
