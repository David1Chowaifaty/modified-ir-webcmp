import { Component, Prop, h, Method, Event, EventEmitter } from '@stencil/core';

@Component({
  tag: 'ir-sidebar',
  styleUrl: 'ir-sidebar.css',
})
export class IrSidebar {
  @Prop() name: string;
  @Prop() side: 'right' | 'left' = 'right';
  @Prop() showCloseButton: boolean = true;
  @Prop({ mutable: true, reflect: true }) open: boolean = false;

  @Event({ bubbles: true, composed: true }) irSidebarToggle: EventEmitter;

  componentWillLoad() {
    this.handleKeyDown = this.handleKeyDown.bind(this);
  }

  componentDidLoad() {
    // If esc key is pressed, close the modal
    document.addEventListener('keydown', this.handleKeyDown);
  }

  private handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      return this.toggleSidebar();
    } else {
      return;
    }
  }

  // Unsubscribe to the event when the component is removed from the DOM
  disconnectedCallback() {
    document.removeEventListener('keydown', this.handleKeyDown);
  }

  @Method()
  async toggleSidebar() {
    this.irSidebarToggle.emit(this.open);
  }

  render() {
    let className = '';
    if (this.open) {
      className = 'active';
    } else {
      className = '';
    }

    return [
      <div
        class={`backdrop ${className}`}
        onClick={() => {
          this.toggleSidebar();
        }}
      ></div>,
      <div class={`sidebar-${this.side} ${className}`}>
        {this.showCloseButton && (
          <a
            class="close"
            onClick={() => {
              this.toggleSidebar();
            }}
          >
            <ir-icon icon="ft-x"></ir-icon>
          </a>
        )}
        <slot />
      </div>,
    ];
  }
}
