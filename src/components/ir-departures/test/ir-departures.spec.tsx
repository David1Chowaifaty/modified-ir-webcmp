import { newSpecPage } from '@stencil/core/testing';
import { IrDepartures } from '../ir-departures';

describe('ir-departures', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrDepartures],
      html: `<ir-departures></ir-departures>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-departures>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-departures>
    `);
  });
});
