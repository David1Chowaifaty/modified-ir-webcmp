import { Component, Method, Prop, h } from '@stencil/core';

@Component({
  tag: 'ir-menu-drawer',
  styleUrl: 'ir-menu-drawer.css',
  shadow: true,
})
export class IrMenuDrawer {
  @Prop({ reflect: true, mutable: true }) open: boolean;

  componentWillLoad() {
    document.addEventListener('keydown', this.handleDocumentKeyDown);
  }

  disconnectedCallback() {
    document.removeEventListener('keydown', this.handleDocumentKeyDown);
  }

  private handleDocumentKeyDown = (e: KeyboardEvent) => {
    const isModifierPressed = e.ctrlKey || e.metaKey;

    if (isModifierPressed && e.key === 'b') {
      e.preventDefault();
      this.open = !this.open;
    }
  };

  @Method()
  async openDrawer() {
    this.open = true;
  }

  render() {
    return (
      <ir-drawer
        class="menu__drawer"
        open={this.open}
        onDrawerHide={e => {
          e.stopImmediatePropagation();
          e.stopPropagation();
          this.open = false;
        }}
        style={{ '--ir-drawer-width': '25rem' }}
        placement="start"
      >
        <slot name="label" slot="label"></slot>
        <slot></slot>
        <slot name="footer" slot="footer"></slot>
      </ir-drawer>
    );
  }
}
