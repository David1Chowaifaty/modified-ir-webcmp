import { newSpecPage } from '@stencil/core/testing';
import { IrTab } from '../ir-tab';

describe('ir-tab', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrTab],
      html: `<ir-tab></ir-tab>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-tab>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-tab>
    `);
  });
});
