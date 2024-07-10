import { newSpecPage } from '@stencil/core/testing';
import { IrHkTeam } from '../ir-hk-team';

describe('ir-hk-team', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrHkTeam],
      html: `<ir-hk-team></ir-hk-team>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-hk-team>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-hk-team>
    `);
  });
});
