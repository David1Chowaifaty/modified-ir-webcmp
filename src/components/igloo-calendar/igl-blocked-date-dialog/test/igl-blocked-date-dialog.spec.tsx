import { newSpecPage } from '@stencil/core/testing';
import { IglBlockedDateDialog } from '../igl-blocked-date-dialog';

describe('igl-blocked-date-dialog', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IglBlockedDateDialog],
      html: `<igl-blocked-date-dialog></igl-blocked-date-dialog>`,
    });
    expect(page.root).toEqualHtml(`
      <igl-blocked-date-dialog>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </igl-blocked-date-dialog>
    `);
  });
});
