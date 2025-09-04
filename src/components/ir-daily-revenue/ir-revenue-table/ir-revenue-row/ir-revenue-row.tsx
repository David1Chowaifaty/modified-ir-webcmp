import { Component, Host, Prop, State, Event, EventEmitter, h, Element, Watch } from '@stencil/core';
import { FolioPayment } from '../../types';
import { formatAmount } from '@/utils/utils';
import calendar_data from '@/stores/calendar-data';

let accId = 0;

@Component({
  tag: 'ir-revenue-row',
  styleUrl: 'ir-revenue-row.css',
  scoped: true,
})
export class IrRevenueRow {
  @Element() host!: HTMLElement;

  /** Array of payments for this method group */
  @Prop() payments: FolioPayment[] = [];

  /** Group display name (e.g., "Credit Card") */
  @Prop() groupName!: string;

  /** Start expanded */
  @Prop() defaultExpanded: boolean = false;

  /** Optional controlled prop: when provided, component follows this value */
  @Prop() expanded?: boolean;

  /** Fired after expansion state changes */
  @Event() irToggle!: EventEmitter<{ expanded: boolean }>;

  @State() _expanded: boolean = false;

  private detailsEl?: HTMLDivElement;
  private contentEl?: HTMLDivElement;
  private headerBtn?: HTMLButtonElement;
  private contentId = `ir-rr-content-${++accId}`;
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
        this.openWithAnimation();
      } else {
        this.closeWithAnimation();
      }

      if (shouldEmit) {
        this.irToggle.emit({ expanded });
      }
    }
  }

  private openWithAnimation() {
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

  private closeWithAnimation() {
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

  private onHeaderClick = () => {
    // Don't allow clicks during animation
    if (this.isAnimating) {
      return;
    }

    const nextExpanded = !this._expanded;

    // For controlled components, just emit the event
    if (this.expanded !== undefined) {
      this.irToggle.emit({ expanded: nextExpanded });
    } else {
      // For uncontrolled components, update state and emit
      this.updateExpansion(nextExpanded, true);
    }
  };

  private onHeaderKeyDown = (ev: KeyboardEvent) => {
    // Allow keyboard toggle with Enter/Space
    if ((ev.key === 'Enter' || ev.key === ' ') && !this.isAnimating) {
      ev.preventDefault();
      this.onHeaderClick();
    }
  };

  render() {
    const total = this.payments.reduce((prev, curr) => prev + curr.amount, 0);
    const isOpen = this._expanded;

    return (
      <Host>
        <div class="ir-revenue-row" data-open={isOpen ? 'true' : 'false'}>
          {/* Header */}
          <button
            type="button"
            class="ir-revenue-row__title"
            aria-expanded={isOpen ? 'true' : 'false'}
            aria-controls={this.contentId}
            aria-busy={this.isAnimating ? 'true' : 'false'}
            onClick={this.onHeaderClick}
            onKeyDown={this.onHeaderKeyDown}
            ref={el => (this.headerBtn = el as HTMLButtonElement)}
            disabled={this.isAnimating}
          >
            <div class="ir-revenue-row__header-left">
              <ir-icons name="angle-down" class={`ir-revenue-row__toggle ${isOpen ? 'is-open' : ''}`} aria-hidden="true"></ir-icons>

              <p class="ir-revenue-row__group">
                {this.groupName}{' '}
                <span class="ir-revenue-row__badge" aria-label={`${this.payments.length} transactions`}>
                  {this.payments.length}
                </span>
              </p>
            </div>
            <p class="ir-revenue-row__total">{formatAmount(calendar_data.currency.symbol, total)}</p>
          </button>

          {/* Collapsible Content */}
          <div
            class="ir-revenue-row__details"
            id={this.contentId}
            ref={el => (this.detailsEl = el as HTMLDivElement)}
            data-expanded={isOpen ? 'true' : null}
            role="region"
            aria-label={`${this.groupName} transactions`}
            aria-hidden={isOpen ? 'false' : 'true'}
          >
            <div class="ir-revenue-row__details-inner" ref={el => (this.contentEl = el as HTMLDivElement)}>
              {this.payments.map(payment => (
                <ir-revenue-row-details class="ir-revenue-row__detail" id={payment.id} payment={payment} key={payment.id}></ir-revenue-row-details>
              ))}
            </div>
          </div>
        </div>
      </Host>
    );
  }
}
