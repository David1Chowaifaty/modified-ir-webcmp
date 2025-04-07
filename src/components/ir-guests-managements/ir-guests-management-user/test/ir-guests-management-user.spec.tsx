import { newSpecPage } from '@stencil/core/testing';
import { IrGuestsManagementUser } from '../ir-guests-management-user';

describe('ir-guests-management-user', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrGuestsManagementUser],
      html: `<ir-guests-management-user></ir-guests-management-user>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-guests-management-user>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-guests-management-user>
    `);
  });
});
