import { newSpecPage } from '@stencil/core/testing';
import { IrRoomGuests } from '../ir-room-guests';

describe('ir-room-guests', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrRoomGuests],
      html: `<ir-room-guests></ir-room-guests>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-room-guests>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-room-guests>
    `);
  });
});
