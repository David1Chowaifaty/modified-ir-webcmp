import { newSpecPage } from '@stencil/core/testing';
import { IrGuestsManagementTable } from '../ir-guests-management-table';

describe('ir-guests-management-table', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrGuestsManagementTable],
      html: `<ir-guests-management-table></ir-guests-management-table>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-guests-management-table>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-guests-management-table>
    `);
  });
});
