import { newSpecPage } from '@stencil/core/testing';
import { IrRevisions } from '../ir-revisions';

describe('ir-revisions', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrRevisions],
      html: `<ir-revisions></ir-revisions>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-revisions>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-revisions>
    `);
  });
});
