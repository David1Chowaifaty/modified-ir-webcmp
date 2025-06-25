import { newSpecPage } from '@stencil/core/testing';
import { IglCalChangeAssignments } from '../igl-cal-change-assignments';

describe('igl-cal-change-assignments', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IglCalChangeAssignments],
      html: `<igl-cal-change-assignments></igl-cal-change-assignments>`,
    });
    expect(page.root).toEqualHtml(`
      <igl-cal-change-assignments>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </igl-cal-change-assignments>
    `);
  });
});
