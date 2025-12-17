import { newSpecPage } from '@stencil/core/testing';
import { IrRoomGuestsForm } from '../ir-room-guests-form';

describe('ir-room-guests-form', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrRoomGuestsForm],
      html: `<ir-room-guests-form></ir-room-guests-form>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-room-guests-form>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-room-guests-form>
    `);
  });
});
