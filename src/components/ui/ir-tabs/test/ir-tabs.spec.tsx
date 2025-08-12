import { newSpecPage } from '@stencil/core/testing';
import { IrTabs } from '../ir-tabs';

describe('ir-tabs', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrTabs],
      html: `<ir-tabs></ir-tabs>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-tabs>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-tabs>
    `);
  });
});
