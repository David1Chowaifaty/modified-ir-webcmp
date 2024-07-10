import { newSpecPage } from '@stencil/core/testing';
import { IrUnitStatus } from '../ir-unit-status';

describe('ir-unit-status', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrUnitStatus],
      html: `<ir-unit-status></ir-unit-status>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-unit-status>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-unit-status>
    `);
  });
});
