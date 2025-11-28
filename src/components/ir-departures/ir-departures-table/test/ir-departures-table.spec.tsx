import { newSpecPage } from '@stencil/core/testing';
import { IrDeparturesTable } from '../ir-departures-table';

describe('ir-departures-table', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrDeparturesTable],
      html: `<ir-departures-table></ir-departures-table>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-departures-table>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-departures-table>
    `);
  });
});
