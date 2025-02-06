import { Component, h, State, Element, EventEmitter, Event, Prop, Listen, Method, Watch } from '@stencil/core';

@Component({
  tag: 'ir-drawer',
  styleUrl: 'ir-drawer.css',
  shadow: true,
})
export class IrDrawer {
  @State() showDrawer: boolean = false;
  @Element() el: HTMLElement;

  /**
   * The title of the drawer
   */
  @Prop() drawerTitle: string;

  /**
   * The placement of the drawer
   */
  @Prop() placement: 'left' | 'right' = 'right';

  /**
   * Is the drawer open?
   */
  @Prop({ mutable: true, reflect: true }) open: boolean = false;

  /**
   * Emitted when the drawer visibility changes.
   */
  @Event() drawerChange: EventEmitter<boolean>;

  /**
   * Emitted when the drawer is requested to be closed via keyboard
   */
  @Event() drawerCloseRequested: EventEmitter<void>;

  componentDidLoad() {
    if (this.open) {
      this.showDrawer = true;
    }
  }

  @Listen('keydown', {
    target: 'document',
    passive: true,
  })
  handleKeyDown(ev: KeyboardEvent) {
    if (this.open) {
      if (ev.key === 'Escape' || ev.key === 'Esc') {
        this.closeDrawer();
        this.drawerCloseRequested.emit();
      }
    }
  }

  @Watch('open')
  openHandler(newValue: boolean) {
    this.showDrawer = newValue;
  }

  toggleDrawer = () => {
    this.open = !this.open;
    this.showDrawer = this.open;
    this.drawerChange.emit(this.open);
  };

  @Method()
  async closeDrawer() {
    this.open = false;
    this.showDrawer = false;
    this.drawerChange.emit(this.open);
  }

  render() {
    return (
      <div class={{ 'app-drawer': true, 'app-drawer--open': this.showDrawer }} aria-hidden={!this.showDrawer}>
        <div class="app-drawer-overlay" onClick={() => this.closeDrawer()} aria-hidden={!this.showDrawer} tabindex={this.showDrawer ? '0' : '-1'}></div>

        <div class={`app-drawer-content app-drawer-content--${this.placement}`} role="dialog" aria-modal="true" aria-labelledby="drawer-title">
          <div class="app-drawer-header">
            <slot name="header">
              <h2 id="drawer-title">{this.drawerTitle}</h2>
            </slot>
          </div>

          <div class="app-drawer-body">
            <slot></slot>
          </div>

          <div class="app-drawer-footer">
            <slot name="footer"></slot>
          </div>
        </div>
      </div>
    );
  }
}
