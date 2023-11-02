import { newSpecPage } from '@stencil/core/testing';
import { IglPagetwo } from '../igl-pagetwo';

describe('igl-pagetwo', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IglPagetwo],
      html: `<igl-pagetwo></igl-pagetwo>`,
    });
    expect(page.root).toEqualHtml(`
      <igl-pagetwo>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </igl-pagetwo>
    `);
  });
});
