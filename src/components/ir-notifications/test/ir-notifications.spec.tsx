import { newSpecPage } from '@stencil/core/testing';
import { IrNotifications } from '../ir-notifications';

describe('ir-notifications', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrNotifications],
      html: `<ir-notifications></ir-notifications>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-notifications>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-notifications>
    `);
  });
});
