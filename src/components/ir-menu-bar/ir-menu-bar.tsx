import { Component, Element, Host, Listen, Method, h } from '@stencil/core';

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

  render() {
    return (
      <Host role="menubar">
        <nav class="menu-bar" part="container">
          <slot></slot>
        </nav>
      </Host>
    );
  }
}
