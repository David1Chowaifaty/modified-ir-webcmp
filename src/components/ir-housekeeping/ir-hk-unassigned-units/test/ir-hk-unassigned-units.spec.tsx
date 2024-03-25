import { newSpecPage } from '@stencil/core/testing';
import { IrHkUnassignedUnits } from '../ir-hk-unassigned-units';

describe('ir-hk-unassigned-units', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrHkUnassignedUnits],
      html: `<ir-hk-unassigned-units></ir-hk-unassigned-units>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-hk-unassigned-units>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-hk-unassigned-units>
    `);
  });
});
