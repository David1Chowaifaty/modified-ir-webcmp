import { Component, Event, EventEmitter, Fragment, Host, Prop, h } from '@stencil/core';

@Component({
  tag: 'ir-menu-bar-item',
  styleUrl: 'ir-menu-bar-item.css',
  shadow: true,
})
export class IrMenuBarItem {
  /**
   * The URL that the menu item should link to.
   * When provided, the component renders as an `<a>` element.
   */
  @Prop() href?: string;

  /**
   * Specifies where to open the linked document.
   * Mirrors the native HTML `target` attribute.
   *
   * Possible values:
   * - `_self` — Opens the link in the same browsing context (default)
   * - `_blank` — Opens the link in a new tab or window
   * - `_parent` — Opens the link in the parent frame
   * - `_top` — Opens the link in the full body of the window
   */
  @Prop() target?: '_self' | '_blank' | '_parent' | '_top';

  /**
   * Displays an `ir-new-badge` next to the trigger when set.
   */
  @Prop({ attribute: 'new', reflect: true }) newBadge = false;
  /**
   * Emitted when the menu bar item is clicked.
   *
   * This event bubbles up from both linked (`<a>`) and non-linked (`<button>`-like) items.
   * You can call `event.preventDefault()` on the listener to stop the default navigation
   * when the item has an `href`.
   *
   * Example:
   * ```js
   * document.querySelector('ir-menu-bar-item').addEventListener('menu-bar-item-click', e => {
   *   e.preventDefault(); // prevents navigation if the item has an href
   *   console.log('Menu item clicked:', e);
   * });
   * ```
   */
  @Event({ eventName: 'menu-bar-item-click' }) menuBarItemClick: EventEmitter<MouseEvent>;

  render() {
    return (
      <Host
        role="menuitem"
        tabindex="-1"
        part="item"
        onClick={e => {
          if (!this.href) this.menuBarItemClick.emit(e);
        }}
      >
        {this.href ? (
          <a
            target={this.target}
            onClick={e => {
              const ce = this.menuBarItemClick.emit(e as MouseEvent);
              if (ce.defaultPrevented) {
                e.preventDefault();
              }
            }}
            class="menu-bar-item__link"
            href={this.href}
          >
            <slot></slot>
            {this.newBadge && <ir-new-badge></ir-new-badge>}
          </a>
        ) : (
          <Fragment>
            <slot></slot>
            {this.newBadge && <ir-new-badge></ir-new-badge>}
          </Fragment>
        )}
      </Host>
    );
  }
}
