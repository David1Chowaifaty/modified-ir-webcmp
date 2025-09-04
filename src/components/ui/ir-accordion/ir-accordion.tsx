import { Component, Host, Prop, State, Event, EventEmitter, h, Element, Watch, Method } from '@stencil/core';

let accId = 0;

@Component({
  tag: 'ir-accordion',
  styleUrl: 'ir-accordion.css',
  shadow: true,
})
export class IrAccordion {
  @Element() host!: HTMLElement;

  /** Start expanded */
  @Prop() defaultExpanded: boolean = false;

  /** Optional controlled prop: when provided, component follows this value */
  @Prop({ mutable: true, reflect: true }) expanded?: boolean;

  /** Show caret icon */
  @Prop() caret: boolean = true;

  /** Caret icon name */
  @Prop() caretIcon: string = 'angle-down';

  /** Fired after expansion state changes */
  @Event({ eventName: 'ir-toggle', bubbles: true, composed: true }) irToggle: EventEmitter<{ expanded: boolean }>;

  @State() _expanded: boolean = false;

  private detailsEl?: HTMLDivElement;
  private contentEl?: HTMLDivElement;
  // private triggerBtn?: HTMLButtonElement;
  private contentId = `ir-accordion-content-${++accId}`;
  private isAnimating = false;
  private cleanupAnimation?: () => void;

  componentWillLoad() {
    this._expanded = this.expanded ?? this.defaultExpanded;
  }

  disconnectedCallback() {
    // Clean up any ongoing animation
    if (this.cleanupAnimation) {
      this.cleanupAnimation();
    }
  }

  @Watch('expanded')
  watchExpanded(newValue: boolean | undefined) {
    if (newValue !== undefined && newValue !== this._expanded) {
      this.updateExpansion(newValue, false); // Don't emit event for external changes
    }
  }

  private updateExpansion(expanded: boolean, shouldEmit: boolean = true) {
    // Prevent multiple simultaneous animations
    if (this.isAnimating) {
      return;
    }

    const wasExpanded = this._expanded;
    this._expanded = expanded;

    // Only animate if the state actually changed
    if (wasExpanded !== expanded) {
      if (expanded) {
        this.show();
      } else {
        this.hide();
      }

      if (shouldEmit) {
        this.irToggle.emit({ expanded });
      }
    }
  }
  @Method()
  async show() {
    if (!this.detailsEl || !this.contentEl || this.isAnimating) return;

    this.isAnimating = true;
    this.cleanupPreviousAnimation();

    // Set initial state
    const startHeight = this.detailsEl.offsetHeight;
    this.detailsEl.style.height = `${startHeight}px`;
    this.detailsEl.style.overflow = 'hidden';

    // Make content visible and measure target height
    this.detailsEl.setAttribute('data-expanded', 'true');
    const targetHeight = this.contentEl.scrollHeight;

    // Use requestAnimationFrame to ensure the browser has processed the initial state
    requestAnimationFrame(() => {
      if (!this.detailsEl) return;

      this.detailsEl.style.height = `${targetHeight}px`;

      const handleTransitionEnd = (event: TransitionEvent) => {
        // Make sure this is the height transition and not a child element
        if (event.target === this.detailsEl && event.propertyName === 'height') {
          this.finishOpenAnimation();
        }
      };

      this.cleanupAnimation = () => {
        if (this.detailsEl) {
          this.detailsEl.removeEventListener('transitionend', handleTransitionEnd);
        }
        this.isAnimating = false;
      };

      this.detailsEl.addEventListener('transitionend', handleTransitionEnd);

      // Fallback timeout in case transitionend doesn't fire
      setTimeout(() => {
        if (this.isAnimating) {
          this.finishOpenAnimation();
        }
      }, 300); // Should match your CSS transition duration
    });
  }
  @Method()
  async hide() {
    if (!this.detailsEl || !this.contentEl || this.isAnimating) return;

    this.isAnimating = true;
    this.cleanupPreviousAnimation();

    // Set initial height to current scrollHeight
    const startHeight = this.detailsEl.scrollHeight;
    this.detailsEl.style.height = `${startHeight}px`;
    this.detailsEl.style.overflow = 'hidden';

    // Force reflow then animate to 0
    requestAnimationFrame(() => {
      if (!this.detailsEl) return;

      this.detailsEl.style.height = '0px';

      const handleTransitionEnd = (event: TransitionEvent) => {
        // Make sure this is the height transition and not a child element
        if (event.target === this.detailsEl && event.propertyName === 'height') {
          this.finishCloseAnimation();
        }
      };

      this.cleanupAnimation = () => {
        if (this.detailsEl) {
          this.detailsEl.removeEventListener('transitionend', handleTransitionEnd);
        }
        this.isAnimating = false;
      };

      this.detailsEl.addEventListener('transitionend', handleTransitionEnd);

      // Fallback timeout
      setTimeout(() => {
        if (this.isAnimating) {
          this.finishCloseAnimation();
        }
      }, 300);
    });
  }

  private finishOpenAnimation() {
    if (this.cleanupAnimation) {
      this.cleanupAnimation();
      this.cleanupAnimation = undefined;
    }

    if (this.detailsEl) {
      this.detailsEl.style.height = '';
      this.detailsEl.style.overflow = '';
    }

    this.expanded = true;
    this.isAnimating = false;
  }

  private finishCloseAnimation() {
    if (this.cleanupAnimation) {
      this.cleanupAnimation();
      this.cleanupAnimation = undefined;
    }

    if (this.detailsEl) {
      this.detailsEl.style.height = '';
      this.detailsEl.style.overflow = '';
      this.detailsEl.removeAttribute('data-expanded');
    }
    this.expanded = false;
    this.isAnimating = false;
  }

  private cleanupPreviousAnimation() {
    if (this.cleanupAnimation) {
      this.cleanupAnimation();
      this.cleanupAnimation = undefined;
    }
    // Always reset isAnimating when cleaning up
    this.isAnimating = false;
  }

  private onTriggerClick = () => {
    // Don't allow clicks during animation
    if (this.isAnimating) {
      return;
    }

    const nextExpanded = !this._expanded;
    this.irToggle.emit({ expanded: nextExpanded });
    this.updateExpansion(nextExpanded, true);
  };

  private onTriggerKeyDown = (ev: KeyboardEvent) => {
    // Allow keyboard toggle with Enter/Space
    if ((ev.key === 'Enter' || ev.key === ' ') && !this.isAnimating) {
      ev.preventDefault();
      this.onTriggerClick();
    }
  };

  render() {
    const isOpen = this._expanded;
    return (
      <Host>
        <div part="base" class="ir-accordion" data-open={isOpen ? 'true' : 'false'}>
          <button
            type="button"
            class="ir-accordion__trigger"
            aria-expanded={isOpen ? 'true' : 'false'}
            aria-controls={this.contentId}
            aria-busy={this.isAnimating ? 'true' : 'false'}
            onClick={this.onTriggerClick}
            onKeyDown={this.onTriggerKeyDown}
            disabled={this.isAnimating}
            part="trigger"
          >
            {this.caret && <ir-icons name={'angle-down'} class={`ir-accordion__caret ${isOpen ? 'is-open' : ''}`} aria-hidden="true"></ir-icons>}

            <div class="ir-accordion__trigger-content">
              <slot name="trigger"></slot>
            </div>
          </button>

          {/* Collapsible Content */}
          <div
            class="ir-accordion__content"
            id={this.contentId}
            ref={el => (this.detailsEl = el as HTMLDivElement)}
            data-expanded={isOpen ? 'true' : null}
            role="region"
            aria-hidden={isOpen ? 'false' : 'true'}
          >
            <div class="ir-accordion__content-inner" part="content" ref={el => (this.contentEl = el as HTMLDivElement)}>
              <slot></slot>
            </div>
          </div>
        </div>
      </Host>
    );
  }
}
