import { newSpecPage } from '@stencil/core/testing';
import { IrDeparturesFilter } from '../ir-departures-filter';

describe('ir-departures-filter', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrDeparturesFilter],
      html: `<ir-departures-filter></ir-departures-filter>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-departures-filter>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-departures-filter>
    `);
  });
});
