import { OverflowAdd, OverflowRelease } from '@/utils/OverflowLock';
import { Component, Element, Host, Listen, Method, State, Watch, h } from '@stencil/core';

let menuBarInstanceCounter = 0;

type MenuComponent = HTMLIrMenuBarMenuElement & {
  focusTrigger?: (options?: FocusOptions) => Promise<void>;
  closeMenuExternally?: (options?: { focusTrigger?: boolean }) => Promise<void>;
};

@Component({
  tag: 'ir-menu-bar',
  styleUrl: 'ir-menu-bar.css',
  shadow: true,
})
export class IrMenuBar {
  @Element() private hostEl!: HTMLElement;

  @State() private isSheetOpen = false;
  @State() private isMobileLayout = false;

  private mediaQuery?: MediaQueryList;
  private mediaQueryCleanup?: () => void;
  private toggleButtonRef?: HTMLButtonElement;
  private closeButtonRef?: HTMLButtonElement;
  private sheetPanelRef?: HTMLDivElement;
  private readonly sheetId = `ir-menu-bar-sheet-${++menuBarInstanceCounter}`;
  private readonly sheetTitleId = `${this.sheetId}-title`;

  private getMenus(): MenuComponent[] {
    return Array.from(this.hostEl.querySelectorAll('ir-menu-bar-menu')) as MenuComponent[];
  }

  private findMenuFromEvent(event: KeyboardEvent): MenuComponent | undefined {
    const path = event.composedPath();
    return this.getMenus().find(menu => path.includes(menu));
  }

  private async focusMenu(menu: MenuComponent | undefined) {
    if (!menu || typeof menu.focusTrigger !== 'function') {
      return;
    }

    await menu.focusTrigger();
  }

  @Listen('keydown')
  async handleKeydown(event: KeyboardEvent) {
    const { key } = event;

    if (this.isMobileLayout) {
      if (this.isSheetOpen && key === 'Escape') {
        event.preventDefault();
        this.closeSheet();
      }
      return;
    }

    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(key)) {
      return;
    }

    const menus = this.getMenus();
    if (menus.length === 0) {
      return;
    }

    const currentMenu = this.findMenuFromEvent(event);
    if (!currentMenu) {
      return;
    }

    const currentIndex = menus.indexOf(currentMenu);
    if (currentIndex === -1) {
      return;
    }

    event.preventDefault();

    let targetIndex = currentIndex;
    switch (key) {
      case 'ArrowLeft':
        targetIndex = (currentIndex - 1 + menus.length) % menus.length;
        break;
      case 'ArrowRight':
        targetIndex = (currentIndex + 1) % menus.length;
        break;
      case 'Home':
        targetIndex = 0;
        break;
      case 'End':
        targetIndex = menus.length - 1;
        break;
    }

    if (targetIndex === currentIndex) {
      return;
    }

    const targetMenu = menus[targetIndex];

    if (typeof currentMenu.closeMenuExternally === 'function') {
      await currentMenu.closeMenuExternally({ focusTrigger: false });
    }

    await this.focusMenu(targetMenu);
  }

  @Method()
  async focusFirstMenu() {
    const [firstMenu] = this.getMenus();
    await this.focusMenu(firstMenu);
  }

  componentWillLoad() {
    this.setupLayoutMode();
  }

  disconnectedCallback() {
    this.mediaQueryCleanup?.();
    this.mediaQueryCleanup = undefined;
  }

  private setupLayoutMode() {
    if (typeof window === 'undefined' || typeof matchMedia === 'undefined') {
      this.isMobileLayout = false;
      return;
    }

    const query = '(min-width: 768px)';
    this.mediaQuery = window.matchMedia(query);

    const evaluateLayout = (mq: MediaQueryList | MediaQueryListEvent) => {
      const isTabletOrAbove = mq.matches;
      this.isMobileLayout = !isTabletOrAbove;
      if (isTabletOrAbove && this.isSheetOpen) {
        this.isSheetOpen = false;
      }
    };

    evaluateLayout(this.mediaQuery);

    const listener = (event: MediaQueryListEvent) => evaluateLayout(event);

    if (typeof this.mediaQuery.addEventListener === 'function') {
      this.mediaQuery.addEventListener('change', listener);
      this.mediaQueryCleanup = () => this.mediaQuery.removeEventListener('change', listener);
    } else {
      this.mediaQuery.addListener(listener);
      this.mediaQueryCleanup = () => this.mediaQuery.removeListener(listener);
    }
  }

  @Watch('isSheetOpen')
  handleSheetOpenChange(open: boolean) {
    this.sheetPanelRef?.toggleAttribute('inert', !open);

    const scheduleFocus = (callback: () => void) => {
      if (typeof requestAnimationFrame === 'function') {
        requestAnimationFrame(callback);
      } else {
        callback();
      }
    };

    if (open) {
      scheduleFocus(() => this.closeButtonRef?.focus());
    } else {
      scheduleFocus(() => this.toggleButtonRef?.focus());
    }
  }

  @OverflowAdd('menuSheet')
  private openSheet() {
    this.isSheetOpen = true;
  }

  @OverflowRelease('menuSheet')
  private closeSheet() {
    this.isSheetOpen = false;
  }

  @Listen('menu-bar-item-click')
  handleMenuItemClick() {
    if (this.isSheetOpen) {
      this.closeSheet();
    }
  }

  @Listen('menuBarOpenChange')
  handleMenuBarOpenChange(e: CustomEvent<boolean>) {
    e.stopImmediatePropagation();
    e.stopPropagation();
    if (e.detail)
      this.getMenus().forEach(m => {
        if (m.id !== (e.target as HTMLIrMenuBarElement).id) {
          m.open = false;
        }
      });
  }

  render() {
    const hostClass = {
      'is-mobile': this.isMobileLayout,
      'sheet-open': this.isSheetOpen,
    };

    return (
      <Host role="menubar" class={hostClass}>
        <nav class="menu-bar" part="container">
          {this.isMobileLayout && (
            <button
              class="menu-toggle"
              part="toggle"
              type="button"
              aria-label={this.isSheetOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={String(this.isSheetOpen)}
              aria-controls={this.sheetId}
              tabIndex={this.isSheetOpen ? -1 : 0}
              onClick={() => (this.isSheetOpen ? this.closeSheet() : this.openSheet())}
              ref={el => (this.toggleButtonRef = el)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="lucide lucide-menu-icon lucide-menu"
              >
                <path d="M4 5h16" />
                <path d="M4 12h16" />
                <path d="M4 19h16" />
              </svg>
            </button>
          )}

          {this.isMobileLayout ? (
            <div id={this.sheetId} class={{ 'menu-sheet': true, 'menu-sheet--open': this.isSheetOpen }} aria-hidden={this.isSheetOpen ? 'false' : 'true'}>
              <div
                class="menu-sheet__panel"
                role="dialog"
                aria-modal="true"
                aria-labelledby={this.sheetTitleId}
                tabIndex={-1}
                ref={el => {
                  this.sheetPanelRef = el;
                  if (el) {
                    el.toggleAttribute('inert', !this.isSheetOpen);
                  }
                }}
              >
                <div class="menu-sheet__header">
                  <slot name="sheet-header">
                    <span id={this.sheetTitleId} class="menu-sheet__title">
                      Menu
                    </span>
                  </slot>
                  <button
                    type="button"
                    class="menu-sheet__close"
                    aria-label="Close menu"
                    onClick={this.closeSheet}
                    tabIndex={this.isSheetOpen ? 0 : -1}
                    ref={el => (this.closeButtonRef = el)}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      class="lucide lucide-x"
                    >
                      <path d="M18 6 6 18" />
                      <path d="m6 6 12 12" />
                    </svg>
                  </button>
                </div>
                <div class="menu-sheet__body">
                  <slot></slot>
                </div>
              </div>
              <div class="menu-sheet__overlay" role="presentation" onClick={this.closeSheet.bind(this)}></div>
            </div>
          ) : (
            <div class="menu-items" part="items">
              <slot></slot>
            </div>
          )}
        </nav>
      </Host>
    );
  }
}
