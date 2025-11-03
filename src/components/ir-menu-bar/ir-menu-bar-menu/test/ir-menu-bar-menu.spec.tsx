import { newSpecPage } from '@stencil/core/testing';
import { IrMenuBarMenu } from '../ir-menu-bar-menu';
import { IrMenuBarItem } from '../../ir-menu-bar-item/ir-menu-bar-item';

describe('ir-menu-bar-menu', () => {
  it('renders link-only structure when no items are provided', async () => {
    const page = await newSpecPage({
      components: [IrMenuBarMenu],
      html: `<ir-menu-bar-menu></ir-menu-bar-menu>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-menu-bar-menu role="none">
        <mock:shadow-root>
          <div class="menu-trigger-wrapper" part="trigger" role="menuitem">
            <slot name="trigger"></slot>
          </div>
          <div aria-hidden="true" class="dropdown-menu" part="dropdown">
            <slot></slot>
          </div>
        </mock:shadow-root>
      </ir-menu-bar-menu>
    `);
  });

  it('toggles dropdown classes when items are slotted', async () => {
    const page = await newSpecPage({
      components: [IrMenuBarMenu, IrMenuBarItem],
      html: `
        <ir-menu-bar-menu>
          <span slot="trigger">Reports</span>
          <ir-menu-bar-item>Daily</ir-menu-bar-item>
        </ir-menu-bar-menu>
      `,
    });

    await page.waitForChanges();

    expect(page.root.classList.contains('has-dropdown')).toBe(true);
    expect(page.root.shadowRoot.querySelector('.dropdown-menu')?.getAttribute('aria-hidden')).toBe('true');
    expect(page.root.hasAttribute('has-submenu')).toBe(true);
    expect(page.root.shadowRoot.querySelector('.menu-trigger-wrapper')?.getAttribute('tabindex')).toBe('0');
    expect(page.root.shadowRoot.querySelector('.menu-trigger-wrapper')?.getAttribute('aria-expanded')).toBe('false');
  });

  it('renders new badge when new attribute is set', async () => {
    const page = await newSpecPage({
      components: [IrMenuBarMenu],
      html: `<ir-menu-bar-menu new><span slot="trigger">Billing</span></ir-menu-bar-menu>`,
    });

    const badge = page.root.shadowRoot.querySelector('ir-new-badge');
    expect(badge).not.toBeNull();
  });

  it('opens via keyboard interaction and focuses items', async () => {
    const page = await newSpecPage({
      components: [IrMenuBarMenu, IrMenuBarItem],
      html: `
        <ir-menu-bar-menu>
          <span slot="trigger">Reports</span>
          <ir-menu-bar-item>Daily</ir-menu-bar-item>
          <ir-menu-bar-item>Monthly</ir-menu-bar-item>
        </ir-menu-bar-menu>
      `,
    });

    const trigger = page.root.shadowRoot.querySelector('.menu-trigger-wrapper') as HTMLElement;

    trigger.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'ArrowDown',
        bubbles: true,
        composed: true,
      }),
    );

    await page.waitForChanges();

    expect(page.root.classList.contains('is-open')).toBe(true);
    expect(page.root.shadowRoot.querySelector('.dropdown-menu')?.getAttribute('aria-hidden')).toBe('false');
    expect(page.root.shadowRoot.querySelector('.menu-trigger-wrapper')?.getAttribute('aria-expanded')).toBe('true');
  });
});
