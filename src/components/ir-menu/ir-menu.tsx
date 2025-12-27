import { Component, Element, Host, Listen, Method, Prop, Watch, h } from '@stencil/core';

@Component({
  tag: 'ir-menu',
  styleUrl: 'ir-menu.css',
  shadow: true,
})
export class IrMenu {
  @Element() el: HTMLElement;

  private menuGroups: HTMLIrMenuGroupElement[] = [];
  private menuItems: HTMLIrMenuItemElement[] = [];

  @Prop({ reflect: true, mutable: true }) selectedHref?: string;

  componentWillLoad() {
    if (!this.selectedHref) {
      this.selectedHref = this.getCurrentLocation();
    } else {
      this.selectedHref = this.normalizeHref(this.selectedHref);
    }
  }

  componentDidLoad() {
    this.handleSlotChange();
  }

  connectedCallback() {
    if (typeof window !== 'undefined') {
      window.addEventListener('popstate', this.handleLocationChange);
    }
  }

  disconnectedCallback() {
    if (typeof window !== 'undefined') {
      window.removeEventListener('popstate', this.handleLocationChange);
    }
  }

  @Method()
  async setSelectedHref(href?: string) {
    this.updateSelectedHref(href);
  }

  @Watch('selectedHref')
  handleSelectedHrefChange(newValue?: string) {
    this.applySelection(newValue);
  }

  private handleSlotChange = () => {
    this.menuGroups = Array.from(this.el.querySelectorAll('ir-menu-group'));
    this.menuItems = Array.from(this.el.querySelectorAll('ir-menu-item'));
    this.applySelection(this.selectedHref);
  };

  private handleLocationChange = () => {
    this.updateSelectedHref(this.getCurrentLocation());
  };

  private updateSelectedHref(href?: string) {
    const normalized = this.normalizeHref(href);
    if (normalized !== this.selectedHref) {
      this.selectedHref = normalized;
    }
  }

  private getCurrentLocation(): string | undefined {
    if (typeof window === 'undefined') return undefined;
    return this.normalizeHref(`${window.location.pathname}${window.location.search}${window.location.hash}`);
  }

  private normalizeHref(href?: string): string | undefined {
    if (!href) return undefined;
    if (typeof window === 'undefined') return href;

    try {
      const url = new URL(href, window.location.origin);
      const normalizedPath = url.pathname.replace(/\/+$/, '') || '/';
      return `${normalizedPath}${url.search}${url.hash}`;
    } catch {
      return href;
    }
  }

  private applySelection(targetHref?: string) {
    const normalizedTarget = this.normalizeHref(targetHref);
    this.menuItems.forEach(item => {
      const itemHref = this.normalizeHref(item.href);
      const shouldSelect = !!normalizedTarget && itemHref === normalizedTarget;

      if (item.selected !== shouldSelect) {
        item.selected = shouldSelect;
      }
    });
  }

  @Listen('click', { capture: true })
  handleItemClick(event: Event) {
    const path = event.composedPath();
    const menuItem = path.find(node => {
      if (!(node instanceof HTMLElement)) return false;
      return node.tagName?.toLowerCase() === 'ir-menu-item';
    }) as HTMLIrMenuItemElement | undefined;

    if (menuItem?.href) {
      this.updateSelectedHref(menuItem.href);
    }
  }

  @Listen('openChanged')
  handleGroupOpen(e: CustomEvent<boolean>) {
    if (!e.detail) return;

    const openedGroup = e.target as HTMLIrMenuGroupElement;
    const groupName = openedGroup.groupName;

    for (const group of this.menuGroups) {
      if (group !== openedGroup && group.groupName === groupName && group.open) {
        group.open = false;
      }
    }
  }

  render() {
    return (
      <Host>
        <slot onSlotchange={this.handleSlotChange} />
      </Host>
    );
  }
}
