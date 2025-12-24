import { newSpecPage } from '@stencil/core/testing';
import { IglBlockedDateDrawer } from '../igl-blocked-date-drawer';

describe('igl-blocked-date-drawer', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IglBlockedDateDrawer],
      html: `<igl-blocked-date-drawer></igl-blocked-date-drawer>`,
    });
    expect(page.root).toEqualHtml(`
      <igl-blocked-date-drawer>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </igl-blocked-date-drawer>
    `);
  });
});
