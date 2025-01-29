import { newSpecPage } from '@stencil/core/testing';
import { IrTasksHeader } from '../ir-tasks-header';

describe('ir-tasks-header', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrTasksHeader],
      html: `<ir-tasks-header></ir-tasks-header>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-tasks-header>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-tasks-header>
    `);
  });
});
