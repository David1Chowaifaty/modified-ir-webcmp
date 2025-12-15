import { newSpecPage } from '@stencil/core/testing';
import { IrPrintRoom } from '../ir-print-room';

describe('ir-print-room', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrPrintRoom],
      html: `<ir-print-room></ir-print-room>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-print-room>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-print-room>
    `);
  });
});
