import { Component, Prop, h, Method, Event, EventEmitter, Watch } from '@stencil/core';

@Component({
  tag: 'ir-sidebar',
  styleUrl: 'ir-sidebar.css',
})
export class IrSidebar {
  @Prop() name: string;
  @Prop() side: 'right' | 'left' = 'right';
  @Prop() showCloseButton: boolean = true;
  @Prop({ mutable: true, reflect: true }) open: boolean = false;
  @Prop() sidebarStyles: Partial<CSSStyleDeclaration>;
  @Event({ bubbles: true, composed: true }) irSidebarToggle: EventEmitter;

  private sidebarRef: HTMLDivElement;

  applyStyles() {
    for (const property in this.sidebarStyles) {
      if (this.sidebarStyles.hasOwnProperty(property)) {
        this.sidebarRef.style[property] = this.sidebarStyles[property];
      }
    }
  }
  @Watch('sidebarStyles')
  handleSidebarStylesChange() {
    this.applyStyles();
  }
  componentWillLoad() {
    this.handleKeyDown = this.handleKeyDown.bind(this);
  }

  componentDidLoad() {
    // If esc key is pressed, close the modal
    this.applyStyles();
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
      <div ref={el => (this.sidebarRef = el)} class={`sidebar-${this.side} ${className}`}>
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
