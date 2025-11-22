import { newSpecPage } from '@stencil/core/testing';
import { IrCustomInput } from '../ir-custom-input';

describe('ir-custom-input', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrCustomInput],
      html: `<ir-custom-input></ir-custom-input>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-custom-input>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-custom-input>
    `);
  });
});
