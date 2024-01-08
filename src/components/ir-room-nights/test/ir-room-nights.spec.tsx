import { newSpecPage } from '@stencil/core/testing';
import { IrRoomNights } from '../ir-room-nights';

describe('ir-room-nights', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrRoomNights],
      html: `<ir-room-nights></ir-room-nights>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-room-nights>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-room-nights>
    `);
  });
});
