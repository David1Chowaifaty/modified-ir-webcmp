import { newSpecPage } from '@stencil/core/testing';
import { IrTestCmp } from '../ir-test-cmp';

describe('ir-test-cmp', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrTestCmp],
      html: `<ir-test-cmp></ir-test-cmp>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-test-cmp>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-test-cmp>
    `);
  });
});
