import { newSpecPage } from '@stencil/core/testing';
import { IrGuestsManagements } from '../ir-guests-managements';

describe('ir-guests-managements', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrGuestsManagements],
      html: `<ir-guests-managements></ir-guests-managements>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-guests-managements>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-guests-managements>
    `);
  });
});
