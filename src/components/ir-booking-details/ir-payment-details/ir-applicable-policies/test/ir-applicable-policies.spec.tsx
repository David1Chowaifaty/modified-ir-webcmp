import { newSpecPage } from '@stencil/core/testing';
import { IrApplicablePolicies } from '../ir-applicable-policies';

describe('ir-applicable-policies', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrApplicablePolicies],
      html: `<ir-applicable-policies></ir-applicable-policies>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-applicable-policies>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-applicable-policies>
    `);
  });
});
