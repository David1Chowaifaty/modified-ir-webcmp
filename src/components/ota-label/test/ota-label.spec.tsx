import { newSpecPage } from '@stencil/core/testing';
import { OtaLabel } from '../ota-label';

describe('ota-label', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [OtaLabel],
      html: `<ota-label></ota-label>`,
    });
    expect(page.root).toEqualHtml(`
      <ota-label>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ota-label>
    `);
  });
});
