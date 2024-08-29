import { Component, Prop, h, Method, Event, EventEmitter, Watch } from '@stencil/core';

@Component({
  tag: 'ir-sidebar',
  styleUrl: 'ir-sidebar.css',
  shadow: true,
})
export class IrSidebar {
  @Prop() name: string;
  @Prop() side: 'right' | 'left' = 'right';
  @Prop() showCloseButton: boolean = true;
  @Prop({ mutable: true, reflect: true }) open: boolean = false;
  @Prop() sidebarStyles: Partial<CSSStyleDeclaration>;
  @Prop() label: string;
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
          <div class={'sidebar-title'}>
            <p class={'p-0 m-0'}>{this.label}</p>
            <div class={'p-0 m-0 sidebar-icon-container'}>
              <ir-icon
                class=""
                onIconClickHandler={() => {
                  this.toggleSidebar();
                }}
              >
                <svg slot="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" height={20} width={20}>
                  <path
                    fill="#6b6f82"
                    d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"
                  />
                </svg>
              </ir-icon>
            </div>
          </div>
        )}
        <slot name="sidebar-body" />
      </div>,
    ];
  }
}
