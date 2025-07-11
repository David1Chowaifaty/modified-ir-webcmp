import { newSpecPage } from '@stencil/core/testing';
import { IrTasksTablePagination } from '../ir-tasks-table-pagination';

describe('ir-tasks-table-pagination', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrTasksTablePagination],
      html: `<ir-tasks-table-pagination></ir-tasks-table-pagination>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-tasks-table-pagination>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-tasks-table-pagination>
    `);
  });
});
