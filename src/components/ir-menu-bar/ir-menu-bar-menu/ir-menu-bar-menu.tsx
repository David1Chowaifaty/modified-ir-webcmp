import { Component, Element, Host, Prop, State, Watch, h } from '@stencil/core';
import { arrow, autoUpdate, computePosition, shift } from '@floating-ui/dom';
@Component({
  tag: 'ir-menu-bar-menu',
  styleUrl: 'ir-menu-bar-menu.css',
  shadow: true,
})
export class IrMenuBarMenu {
  @Element() private hostEl!: HTMLElement;

  /**
   * Displays an `ir-new-badge` next to the trigger when set.
   */
  @Prop({ attribute: 'new', reflect: true }) newBadge = false;

  @State() private hasDropdown = false;
  @State() private isOpen = false;
  @State() private isAccordionLayout = false;

  private dropdownContainerRef: HTMLDivElement;
  private menuTriggerRef: HTMLDivElement;

  private cleanupAutoUpdate?: () => void;
  private mediaQuery?: MediaQueryList;
  private mediaQueryCleanup?: () => void;
  private closeTimeout?: number;

  private get items(): HTMLElement[] {
    return Array.from(this.hostEl.querySelectorAll('ir-menu-bar-item')).filter(item => item.parentElement === this.hostEl && !item.slot) as HTMLElement[];
  }

  private updateDropdownState() {
    const hasDropdown = this.items.length > 1;

    if (hasDropdown !== this.hasDropdown) {
      this.hasDropdown = hasDropdown;
    }

    if (!hasDropdown && this.isOpen) {
      this.isOpen = false;
    }

    this.hostEl.toggleAttribute('has-submenu', hasDropdown);
  }

  componentWillLoad() {
    this.updateDropdownState();
    this.setupLayoutMode();
  }

  @Watch('isOpen')
  handleOpenChange(open: boolean) {
    if (!this.hasDropdown) return;

    if (this.isAccordionLayout) {
      this.cleanupAutoUpdate?.();
      this.cleanupAutoUpdate = undefined;
      this.updateAccordionHeight(open);
      return;
    }

    if (open) {
      const arrowElement = this.hostEl.shadowRoot.querySelector('#arrow');

      requestAnimationFrame(() => {
        this.cleanupAutoUpdate = autoUpdate(this.menuTriggerRef, this.dropdownContainerRef, () => {
          computePosition(this.menuTriggerRef, this.dropdownContainerRef, {
            strategy: 'fixed',
            placement: 'bottom-start',
            middleware: [shift(), arrow({ element: arrowElement })],
          }).then(({ x, y, placement, middlewareData }) => {
            Object.assign(this.dropdownContainerRef.style, {
              left: `${x}px`,
              top: `${y}px`,
            });
            const { x: arrowX, y: arrowY } = middlewareData.arrow;

            const staticSide = {
              top: 'bottom',
              right: 'left',
              bottom: 'top',
              left: 'right',
            }[placement.split('-')[0]];

            Object.assign((arrowElement as HTMLElement).style, {
              left: arrowX != null ? `${arrowX}px` : '',
              top: arrowY != null ? `${arrowY}px` : '',
              right: '',
              bottom: '',
              [staticSide]: '-4px',
            });
          });
        });
      });
    } else {
      this.cleanupAutoUpdate?.();
      this.cleanupAutoUpdate = undefined;
      this.cancelDropdownClose();
    }
  }

  componentDidLoad() {
    this.updateDropdownState();
    if (this.isAccordionLayout) {
      this.updateAccordionHeight(this.isOpen);
    }
  }

  disconnectedCallback() {
    this.cleanupAutoUpdate?.();
    this.cleanupAutoUpdate = undefined;
    this.mediaQueryCleanup?.();
    this.mediaQueryCleanup = undefined;
    this.cancelDropdownClose();
  }

  private handleItemsSlotChange = () => {
    this.updateDropdownState();
    if (this.isAccordionLayout && this.isOpen) {
      // refresh measured height when slot content changes
      requestAnimationFrame(() => this.updateAccordionHeight(true));
    }
  };

  private setupLayoutMode() {
    if (typeof window === 'undefined' || typeof matchMedia === 'undefined') {
      this.isAccordionLayout = false;
      return;
    }

    const query = '(min-width: 768px)';
    this.mediaQuery = window.matchMedia(query);

    const evaluateLayout = (mq: MediaQueryList | MediaQueryListEvent) => {
      const isDropdownLayout = mq.matches;
      this.isAccordionLayout = !isDropdownLayout;

      if (isDropdownLayout) {
        this.cancelDropdownClose();
        this.dropdownContainerRef?.style.removeProperty('height');
        this.dropdownContainerRef?.style.removeProperty('display');
        if (this.isOpen) {
          this.isOpen = false;
        }
      } else if (this.dropdownContainerRef) {
        this.cancelDropdownClose();
        if (this.isOpen) {
          requestAnimationFrame(() => this.updateAccordionHeight(true));
        } else {
          this.dropdownContainerRef.style.height = '0px';
        }
      }

      if (isDropdownLayout) {
        // ensure open state recalculates floating UI positioning
        if (this.isOpen) {
          this.handleOpenChange(true);
        }
      } else {
        this.cleanupAutoUpdate?.();
        this.cleanupAutoUpdate = undefined;
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

  private updateAccordionHeight(open: boolean) {
    if (!this.dropdownContainerRef) return;

    const dropdownEl = this.dropdownContainerRef;

    if (open) {
      const contentHeight = dropdownEl.scrollHeight;
      dropdownEl.style.height = `${contentHeight}px`;
    } else {
      if (dropdownEl.style.height === 'auto') {
        dropdownEl.style.height = `${dropdownEl.scrollHeight}px`;
      }
      requestAnimationFrame(() => {
        dropdownEl.style.height = '0px';
      });
    }
  }

  private handleAccordionTransitionEnd = (event: TransitionEvent) => {
    if (!this.isAccordionLayout) return;
    if (event.target !== this.dropdownContainerRef || event.propertyName !== 'height') return;

    if (this.isOpen) {
      this.dropdownContainerRef.style.height = 'auto';
    }
  };

  private scheduleDropdownClose() {
    if (!this.hasDropdown || this.isAccordionLayout) return;
    this.cancelDropdownClose();
    this.closeTimeout = window.setTimeout(() => {
      this.closeTimeout = undefined;
      this.isOpen = false;
    }, 150);
  }

  private cancelDropdownClose() {
    if (this.closeTimeout !== undefined) {
      clearTimeout(this.closeTimeout);
      this.closeTimeout = undefined;
    }
  }

  render() {
    const hostClass = {
      'has-dropdown': this.hasDropdown,
      'is-open': this.hasDropdown && this.isOpen,
      'is-accordion': this.isAccordionLayout,
      'is-dropdown': this.hasDropdown && !this.isAccordionLayout,
    };
    const supportsDropdownHover = this.hasDropdown && !this.isAccordionLayout;
    return (
      <Host
        class={hostClass}
        role="none"
        onPointerEnter={
          supportsDropdownHover
            ? () => {
                this.cancelDropdownClose();
                this.isOpen = true;
              }
            : undefined
        }
        onPointerLeave={supportsDropdownHover ? () => this.scheduleDropdownClose() : undefined}
      >
        <div
          class="menu-trigger-wrapper"
          part="trigger"
          role="menuitem"
          onClick={() => (this.isOpen = !this.isOpen)}
          ref={el => (this.menuTriggerRef = el)}
          tabindex={this.hasDropdown ? '0' : undefined}
          aria-haspopup={this.hasDropdown ? 'menu' : undefined}
          aria-expanded={this.hasDropdown ? String(this.isOpen) : undefined}
        >
          <slot name="trigger"></slot>
          {this.hasDropdown &&
            (!this.isOpen ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="menu-bar-menu__accordion_indicator"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="menu-bar-menu__accordion_indicator"
              >
                <path d="m18 15-6-6-6 6" />
              </svg>
            ))}
          {this.newBadge && <ir-new-badge class="menu-new-badge" part="new-indicator"></ir-new-badge>}
        </div>
        <div
          class="dropdown-menu"
          ref={el => (this.dropdownContainerRef = el)}
          part="dropdown"
          role={this.hasDropdown ? 'menu' : undefined}
          aria-hidden={!this.hasDropdown || !this.isOpen ? 'true' : 'false'}
          onTransitionEnd={this.handleAccordionTransitionEnd}
        >
          <div id="arrow"></div>
          <slot onSlotchange={this.handleItemsSlotChange}></slot>
        </div>
      </Host>
    );
  }
}
