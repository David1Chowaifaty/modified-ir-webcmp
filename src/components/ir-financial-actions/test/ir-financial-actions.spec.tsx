import { newSpecPage } from '@stencil/core/testing';
import { IrFinancialActions } from '../ir-financial-actions';

describe('ir-financial-actions', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrFinancialActions],
      html: `<ir-financial-actions></ir-financial-actions>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-financial-actions>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-financial-actions>
    `);
  });
});
