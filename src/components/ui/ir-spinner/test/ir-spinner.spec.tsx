import { newSpecPage } from '@stencil/core/testing';
import { IrSpinner } from '../ir-spinner';

describe('ir-spinner', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrSpinner],
      html: `<ir-spinner></ir-spinner>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-spinner>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-spinner>
    `);
  });
});
