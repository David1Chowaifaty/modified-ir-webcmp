import { newSpecPage } from '@stencil/core/testing';
import { IrTasksTable } from '../ir-tasks-table';

describe('ir-tasks-table', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrTasksTable],
      html: `<ir-tasks-table></ir-tasks-table>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-tasks-table>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-tasks-table>
    `);
  });
});
