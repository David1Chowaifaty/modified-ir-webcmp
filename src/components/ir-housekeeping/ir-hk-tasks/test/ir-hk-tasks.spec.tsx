import { newSpecPage } from '@stencil/core/testing';
import { IrHkTasks } from '../ir-hk-tasks';

describe('ir-hk-tasks', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrHkTasks],
      html: `<ir-hk-tasks></ir-hk-tasks>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-hk-tasks>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-hk-tasks>
    `);
  });
});
