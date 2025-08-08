import { newSpecPage } from '@stencil/core/testing';
import { AcPagesMenu } from '../ac-pages-menu';

describe('ac-pages-menu', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [AcPagesMenu],
      html: `<ac-pages-menu></ac-pages-menu>`,
    });
    expect(page.root).toEqualHtml(`
      <ac-pages-menu>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ac-pages-menu>
    `);
  });
});
