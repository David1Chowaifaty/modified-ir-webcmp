import { newSpecPage } from '@stencil/core/testing';
import { IrPopup } from '../ir-popup';

describe('ir-popup', () => {
  it('renders default trigger and popup wrappers', async () => {
    const page = await newSpecPage({
      components: [IrPopup],
      html: `<ir-popup></ir-popup>`,
    });

    expect(page.root).toEqualHtml(`
      <ir-popup data-open="false" placement="top">
        <mock:shadow-root>
          <div aria-controls="ir-popup-panel-1" aria-expanded="false" aria-haspopup="dialog" class="trigger" part="trigger">
            <slot name="trigger"></slot>
          </div>
          <div aria-hidden="true" class="popup" data-open="false" id="ir-popup-panel-1" part="panel" role="dialog">
            <slot></slot>
          </div>
        </mock:shadow-root>
      </ir-popup>
    `);
  });

  it('honors defaultOpen', async () => {
    const page = await newSpecPage({
      components: [IrPopup],
      html: `<ir-popup default-open></ir-popup>`,
    });

    expect(page.root?.getAttribute('open')).toBe('');
  });
});
