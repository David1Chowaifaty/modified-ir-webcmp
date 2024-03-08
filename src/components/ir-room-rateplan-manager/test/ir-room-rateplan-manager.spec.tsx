import { newSpecPage } from '@stencil/core/testing';
import { IrRoomRateplanManager } from '../ir-room-rateplan-manager';

describe('ir-room-rateplan-manager', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrRoomRateplanManager],
      html: `<ir-room-rateplan-manager></ir-room-rateplan-manager>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-room-rateplan-manager>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-room-rateplan-manager>
    `);
  });
});
