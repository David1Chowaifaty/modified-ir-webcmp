import { newSpecPage } from '@stencil/core/testing';
import { IrUnitTag } from '../ir-unit-tag';

describe('ir-unit-tag', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrUnitTag],
      html: `<ir-unit-tag></ir-unit-tag>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-unit-tag>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-unit-tag>
    `);
  });
});
