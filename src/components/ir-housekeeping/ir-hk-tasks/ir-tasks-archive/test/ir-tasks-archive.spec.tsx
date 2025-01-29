import { newSpecPage } from '@stencil/core/testing';
import { IrTasksArchive } from '../ir-tasks-archive';

describe('ir-tasks-archive', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrTasksArchive],
      html: `<ir-tasks-archive></ir-tasks-archive>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-tasks-archive>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-tasks-archive>
    `);
  });
});
