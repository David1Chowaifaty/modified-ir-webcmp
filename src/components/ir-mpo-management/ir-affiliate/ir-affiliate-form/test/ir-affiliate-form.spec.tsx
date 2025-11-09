import { newSpecPage } from '@stencil/core/testing';
import { IrAffiliateForm } from '../ir-affiliate-form';

describe('ir-affiliate-form', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrAffiliateForm],
      html: `<ir-affiliate-form></ir-affiliate-form>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-affiliate-form>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-affiliate-form>
    `);
  });
});
