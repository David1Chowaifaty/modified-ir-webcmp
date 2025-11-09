import { newSpecPage } from '@stencil/core/testing';
import { IrWhiteLabeling } from '../ir-white-labeling';

describe('ir-white-labeling', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrWhiteLabeling],
      html: `<ir-white-labeling></ir-white-labeling>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-white-labeling>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-white-labeling>
    `);
  });
});
