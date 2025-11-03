import { Component, Element, Host, Listen, Method, Prop, State, h } from '@stencil/core';

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
  @State() private activeItemIndex = -1;

  private get triggerElement(): HTMLElement | null {
    return this.hostEl.shadowRoot?.querySelector('.menu-trigger-wrapper') as HTMLElement | null;
  }

  private get items(): HTMLElement[] {
    return Array.from(this.hostEl.querySelectorAll('ir-menu-bar-item')).filter(item => item.parentElement === this.hostEl && !item.slot) as HTMLElement[];
  }

  private closeTimeout?: number;

  private updateDropdownState() {
    const hasDropdown = this.items.length > 0;

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
  }

  componentDidLoad() {
    this.updateDropdownState();
  }

  private handleItemsSlotChange = () => {
    this.updateDropdownState();
  };

  private isNodeWithinMenu(target: EventTarget | null): boolean {
    if (!(target instanceof Node)) {
      return false;
    }

    if (target === this.hostEl) {
      return true;
    }

    if (this.hostEl.contains(target)) {
      return true;
    }

    const shadow = this.hostEl.shadowRoot;
    return shadow ? shadow.contains(target) : false;
  }

  private focusTriggerElement(options?: FocusOptions) {
    const trigger = this.triggerElement;
    if (!trigger) {
      return;
    }

    if (!trigger.hasAttribute('tabindex')) {
      trigger.setAttribute('tabindex', '0');
    }

    trigger.focus(options);
  }

  private setOpenState(isOpen: boolean, focusTrigger = false) {
    if (!this.hasDropdown) {
      return;
    }

    this.isOpen = isOpen;
    if (!isOpen) {
      this.activeItemIndex = -1;
      if (focusTrigger) {
        this.focusTriggerElement();
      }
    }
  }

  private openMenuInternal({ focusFirstItem = false } = {}) {
    if (!this.hasDropdown) {
      return;
    }

    this.cancelScheduledClose();
    this.isOpen = true;
    this.activeItemIndex = -1;

    if (focusFirstItem) {
      this.focusItem(0);
    }
  }

  private closeMenuInternal({ focusTrigger = false } = {}) {
    this.cancelScheduledClose();
    this.setOpenState(false, focusTrigger);
  }

  private scheduleClose() {
    this.cancelScheduledClose();
    this.closeTimeout = window.setTimeout(() => {
      this.closeTimeout = undefined;
      this.closeMenuInternal();
    }, 100);
  }

  private cancelScheduledClose() {
    if (this.closeTimeout !== undefined) {
      clearTimeout(this.closeTimeout);
      this.closeTimeout = undefined;
    }
  }

  private focusItem(index: number) {
    const items = this.items;
    if (items.length === 0) {
      return;
    }

    const normalizedIndex = (index + items.length) % items.length;
    const item = items[normalizedIndex];

    item?.focus();
    this.activeItemIndex = normalizedIndex;
  }

  private focusNextItem() {
    if (this.activeItemIndex === -1) {
      this.focusItem(0);
    } else {
      this.focusItem(this.activeItemIndex + 1);
    }
  }

  private focusPreviousItem() {
    if (this.activeItemIndex === -1) {
      this.focusItem(this.items.length - 1);
    } else {
      this.focusItem(this.activeItemIndex - 1);
    }
  }

  private isEventFromTrigger(event: Event) {
    const trigger = this.triggerElement;
    if (!trigger) {
      return false;
    }

    return event.composedPath().includes(trigger);
  }

  private isEventFromMenuItem(event: Event) {
    const path = event.composedPath();
    return this.items.some(item => path.includes(item));
  }

  private activateTriggerContent() {
    const triggerSlot = this.hostEl.shadowRoot?.querySelector('slot[name="trigger"]') as HTMLSlotElement | null;
    const assignedElements = triggerSlot?.assignedElements({ flatten: true }) ?? [];
    const interactive = assignedElements.find((el): el is HTMLElement => typeof (el as HTMLElement).click === 'function');

    if (interactive) {
      interactive.click();
    }
  }

  @Listen('mouseenter')
  handleMouseEnter() {
    if (this.hasDropdown) {
      this.cancelScheduledClose();
      this.isOpen = true;
    }
  }

  @Listen('mouseleave')
  handleMouseLeave(event: MouseEvent) {
    if (!this.hasDropdown) {
      return;
    }

    if (this.isNodeWithinMenu(event.relatedTarget)) {
      this.cancelScheduledClose();
      return;
    }

    this.scheduleClose();
  }

  @Listen('focusin')
  handleFocusIn(event: FocusEvent) {
    if (!this.hasDropdown) {
      return;
    }

    if (this.isEventFromMenuItem(event)) {
      this.cancelScheduledClose();
      this.isOpen = true;
    }
  }

  @Listen('focusout')
  handleFocusOut(event: FocusEvent) {
    if (!this.hasDropdown) {
      return;
    }

    if (!this.isNodeWithinMenu(event.relatedTarget)) {
      this.scheduleClose();
    }
  }

  @Listen('keydown')
  handleKeydown(event: KeyboardEvent) {
    const { key } = event;

    if (this.hasDropdown) {
      if (key === 'Escape') {
        event.preventDefault();
        this.closeMenuInternal({ focusTrigger: true });
        return;
      }

      if (this.isEventFromTrigger(event)) {
        if (key === 'Enter' || key === ' ') {
          event.preventDefault();
          if (this.isOpen) {
            this.closeMenuInternal({ focusTrigger: true });
          } else {
            this.openMenuInternal({ focusFirstItem: true });
          }
          return;
        }

        if (key === 'ArrowDown') {
          event.preventDefault();
          this.openMenuInternal({ focusFirstItem: true });
          return;
        }

        if (key === 'ArrowUp') {
          event.preventDefault();
          this.openMenuInternal({ focusFirstItem: false });
          this.focusItem(this.items.length - 1);
          return;
        }
      }

      if (this.isEventFromMenuItem(event)) {
        switch (key) {
          case 'ArrowDown':
            event.preventDefault();
            this.focusNextItem();
            return;
          case 'ArrowUp':
            event.preventDefault();
            this.focusPreviousItem();
            return;
          case 'Home':
            event.preventDefault();
            this.focusItem(0);
            return;
          case 'End':
            event.preventDefault();
            this.focusItem(this.items.length - 1);
            return;
          case 'Tab':
            this.closeMenuInternal();
            return;
        }
      }
    } else if (this.isEventFromTrigger(event)) {
      if (key === 'Enter' || key === ' ') {
        event.preventDefault();
        this.activateTriggerContent();
      }
    }
  }

  @Method()
  async focusTrigger(options?: FocusOptions) {
    this.focusTriggerElement(options);
  }

  @Method()
  async closeMenuExternally(options?: { focusTrigger?: boolean }) {
    this.closeMenuInternal({ focusTrigger: options?.focusTrigger });
  }

  @Method()
  async hasSubmenu(): Promise<boolean> {
    return this.hasDropdown;
  }

  render() {
    const hostClass = {
      'has-dropdown': this.hasDropdown,
      'is-open': this.hasDropdown && this.isOpen,
    };

    return (
      <Host class={hostClass} role="none">
        <div
          class="menu-trigger-wrapper"
          part="trigger"
          role="menuitem"
          tabindex={this.hasDropdown ? '0' : undefined}
          aria-haspopup={this.hasDropdown ? 'menu' : undefined}
          aria-expanded={this.hasDropdown ? String(this.isOpen) : undefined}
        >
          <slot name="trigger"></slot>
          {this.newBadge && <ir-new-badge class="menu-new-badge" part="new-indicator"></ir-new-badge>}
        </div>
        <div class="dropdown-menu" part="dropdown" role={this.hasDropdown ? 'menu' : undefined} aria-hidden={!this.hasDropdown || !this.isOpen ? 'true' : 'false'}>
          <slot onSlotchange={this.handleItemsSlotChange}></slot>
        </div>
      </Host>
    );
  }
}
