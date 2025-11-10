import { newSpecPage } from '@stencil/core/testing';
import { IrTabPanel } from '../ir-tab-panel';

describe('ir-tab-panel', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrTabPanel],
      html: `<ir-tab-panel></ir-tab-panel>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-tab-panel>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-tab-panel>
    `);
  });
});
