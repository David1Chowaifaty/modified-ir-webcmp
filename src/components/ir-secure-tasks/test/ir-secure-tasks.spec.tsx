import { newSpecPage } from '@stencil/core/testing';
import { IrSecureTasks } from '../ir-secure-tasks';

describe('ir-secure-tasks', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrSecureTasks],
      html: `<ir-secure-tasks></ir-secure-tasks>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-secure-tasks>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-secure-tasks>
    `);
  });
});
