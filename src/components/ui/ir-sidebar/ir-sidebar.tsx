import { handleBodyOverflow } from '@/utils/utils';
import { Component, Prop, h, Method, Event, EventEmitter, Watch, Listen, Element } from '@stencil/core';

@Component({
  tag: 'ir-sidebar',
  styleUrl: 'ir-sidebar.css',
  shadow: true,
})
export class IrSidebar {
  @Element() el: HTMLIrSidebarElement;
  /**
   * Identifier for the sidebar instance.
   */
  @Prop() name: string;

  /**
   * Which side of the screen the sidebar appears on.
   * Options: `'left'` or `'right'`.
   */
  @Prop() side: 'right' | 'left' = 'right';

  /**
   * Whether to show the close (X) button in the sidebar header.
   */
  @Prop() showCloseButton: boolean = true;

  /**
   * Whether the sidebar is open.
   * Can be used with two-way binding.
   */
  @Prop({ mutable: true, reflect: true }) open: boolean = false;

  /**
   * Inline styles applied to the sidebar container.
   */
  @Prop() sidebarStyles: Partial<CSSStyleDeclaration>;

  /**
   * Label text displayed in the sidebar header.
   */
  @Prop() label: string;

  /**
   * Prevents the sidebar from closing when `toggleSidebar()` is called.
   * When true, emits `beforeSidebarClose` instead of toggling.
   */
  @Prop() preventClose: boolean;

  /**
   * Event emitted when the sidebar is toggled open/closed.
   * Emits the current `open` state.
   */
  @Event({ bubbles: true, composed: true }) irSidebarToggle: EventEmitter;

  /**
   * Event emitted *before* the sidebar attempts to close,
   * but only if `preventClose` is set to true.
   */
  @Event({ bubbles: true, composed: true }) beforeSidebarClose: EventEmitter;

  private sidebarRef: HTMLDivElement;

  componentDidLoad() {
    this.applyStyles();
  }

  @Watch('sidebarStyles')
  handleSidebarStylesChange() {
    this.applyStyles();
  }

  @Watch('open')
  handleOpenChange(newValue: boolean, oldValue: boolean) {
    if (newValue !== oldValue) {
      handleBodyOverflow(newValue);
    }
  }

  @Listen('keydown', { target: 'body' })
  handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Escape' && this.open) {
      e.stopImmediatePropagation();
      e.stopPropagation();
      return this.toggleSidebar();
    } else {
      return;
    }
  }

  /**
   * Toggles the sidebar's visibility.
   *
   * - If `preventClose` is true, emits `beforeSidebarClose` and does nothing else.
   * - Otherwise, emits `irSidebarToggle` with the current `open` state.
   *
   * Example:
   * ```ts
   * const el = document.querySelector('ir-sidebar');
   * await el.toggleSidebar();
   * ```
   */
  @Method()
  async toggleSidebar() {
    if (this.preventClose) {
      this.beforeSidebarClose.emit();
      return;
    }
    this.irSidebarToggle.emit(this.open);
  }

  /**
   * Applies inline styles defined in `sidebarStyles` to the sidebar container.
   */
  private applyStyles() {
    for (const property in this.sidebarStyles) {
      if (this.sidebarStyles.hasOwnProperty(property)) {
        this.sidebarRef.style[property] = this.sidebarStyles[property];
      }
    }
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
