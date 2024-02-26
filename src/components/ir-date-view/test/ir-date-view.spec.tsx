import { newSpecPage } from '@stencil/core/testing';
import { IrDateView } from '../ir-date-view';

describe('ir-date-view', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrDateView],
      html: `<ir-date-view></ir-date-view>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-date-view>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-date-view>
    `);
  });
});
