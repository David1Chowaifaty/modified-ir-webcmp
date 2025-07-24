import { newSpecPage } from '@stencil/core/testing';
import { IrProgressIndicator } from '../ir-progress-indicator';

describe('ir-progress-indicator', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrProgressIndicator],
      html: `<ir-progress-indicator></ir-progress-indicator>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-progress-indicator>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-progress-indicator>
    `);
  });
});
