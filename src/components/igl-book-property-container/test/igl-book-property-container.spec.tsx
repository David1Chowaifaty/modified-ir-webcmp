import { newSpecPage } from '@stencil/core/testing';
import { IglBookPropertyContainer } from '../igl-book-property-container';

describe('igl-book-property-container', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IglBookPropertyContainer],
      html: `<igl-book-property-container></igl-book-property-container>`,
    });
    expect(page.root).toEqualHtml(`
      <igl-book-property-container>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </igl-book-property-container>
    `);
  });
});
