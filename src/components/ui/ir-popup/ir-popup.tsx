import { Component, Element, Event, EventEmitter, Host, Prop, Watch, h } from '@stencil/core';
import { autoUpdate, computePosition, flip, offset, shift } from '@floating-ui/dom';

export type PopupChangeReason = 'manual' | 'outside' | 'escape' | 'default';

let popupId = 0;

@Component({
  tag: 'ir-popup',
  styleUrl: 'ir-popup.css',
  shadow: true,
})
export class IrPopup {
  @Element() host!: HTMLElement;

  /** Initial open state when the popup is uncontrolled. */
  @Prop() defaultOpen: boolean = false;

  /** Reflects whether the popup panel is visible. */
  @Prop({ reflect: true, mutable: true }) open: boolean = false;

  /** Choose how the popup toggles open (click or hover). */
  @Prop() interaction: 'click' | 'hover' = 'click';

  /** Placement string recognized by Floating UI. */
  @Prop({ reflect: true }) placement:
    | 'top'
    | 'top-start'
    | 'top-end'
    | 'bottom'
    | 'bottom-start'
    | 'bottom-end'
    | 'right'
    | 'right-start'
    | 'right-end'
    | 'left'
    | 'left-start'
    | 'left-end' = 'top';

  /** Positioning strategy applied to the floating element. */
  @Prop() strategy: 'fixed' | 'absolute' = 'fixed';

  /** Main-axis distance in pixels between the trigger and popup. */
  @Prop() distance = 0;

  /** Cross-axis skidding in pixels between the trigger and popup. */
  @Prop() skidding = 0;

  /** Enable flip middleware to keep the popup visible. */
  @Prop() flip: boolean = false;

  /** Strategy used by Floating UI when multiple flip candidates exist. */
  @Prop({ attribute: 'flip-fallback-strategy' }) flipFallbackStrategy: 'best-fit' | 'initial' = 'best-fit';

  /** Viewport padding passed to the shift middleware. */
  @Prop() shiftPadding: number = 4;

  /** Close the popup when clicking outside of the host. */
  @Prop() closeOnOutsideClick: boolean = true;

  /** Close the popup when the Escape key is pressed. */
  @Prop() closeOnEsc: boolean = true;

  /** Fired whenever the popup open state changes. */
  @Event({ eventName: 'ir-popup-open-change' })
  irPopupOpenChange: EventEmitter<{ open: boolean; reason: PopupChangeReason }>;

  private popupTriggerRef?: HTMLDivElement;
  private popupMenuRef?: HTMLDivElement;
  private cleanupAutoUpdate?: () => void;
  private pendingReason: PopupChangeReason = 'manual';
  private popupPanelId = `ir-popup-panel-${++popupId}`;
  private positionRaf?: number;
  private detachInteractionListeners?: () => void;
  private detachHoverClickBlocker?: () => void;

  componentWillLoad() {
    if (!this.open && this.defaultOpen) {
      this.pendingReason = 'default';
      this.open = true;
    }
  }

  componentDidLoad() {
    this.start();
    this.setupInteractionListeners();
  }

  disconnectedCallback() {
    this.stop();
  }

  @Watch('open')
  handleOpenChange(newValue: boolean) {
    if (newValue) {
      this.enableAutoUpdate();
    } else {
      this.disableAutoUpdate();
    }

    this.irPopupOpenChange.emit({ open: newValue, reason: this.pendingReason });
    this.pendingReason = 'manual';
  }

  @Watch('placement')
  @Watch('strategy')
  @Watch('distance')
  @Watch('skidding')
  @Watch('flip')
  @Watch('flipFallbackStrategy')
  @Watch('shiftPadding')
  handlePositioningChange() {
    this.queuePositionUpdate();
  }

  @Watch('interaction')
  handleInteractionChange() {
    this.setupInteractionListeners();
  }

  private start() {
    document.addEventListener('click', this.handleDocumentClick, true);
    document.addEventListener('keydown', this.handleDocumentKeydown);

    if (this.open) {
      this.enableAutoUpdate();
    }
  }

  private stop() {
    document.removeEventListener('click', this.handleDocumentClick, true);
    document.removeEventListener('keydown', this.handleDocumentKeydown);
    this.disableAutoUpdate();
    if (this.positionRaf) {
      cancelAnimationFrame(this.positionRaf);
      this.positionRaf = undefined;
    }
    if (this.detachInteractionListeners) {
      this.detachInteractionListeners();
      this.detachInteractionListeners = undefined;
    }
    if (this.detachHoverClickBlocker) {
      this.detachHoverClickBlocker();
      this.detachHoverClickBlocker = undefined;
    }
  }

  private setOpen(next: boolean, reason: PopupChangeReason) {
    if (this.open === next) {
      return;
    }
    this.pendingReason = reason;
    this.open = next;
  }

  private enableAutoUpdate() {
    if (!this.popupTriggerRef || !this.popupMenuRef) {
      return;
    }

    this.disableAutoUpdate();
    this.cleanupAutoUpdate = autoUpdate(this.popupTriggerRef, this.popupMenuRef, () => {
      this.updatePosition();
    });
    this.updatePosition();
  }

  private disableAutoUpdate() {
    if (this.cleanupAutoUpdate) {
      this.cleanupAutoUpdate();
      this.cleanupAutoUpdate = undefined;
    }
  }

  private queuePositionUpdate() {
    if (!this.open) {
      return;
    }

    if (this.positionRaf) {
      cancelAnimationFrame(this.positionRaf);
    }

    this.positionRaf = requestAnimationFrame(() => {
      this.positionRaf = undefined;
      this.updatePosition();
    });
  }

  private async updatePosition() {
    if (!this.popupTriggerRef || !this.popupMenuRef) {
      return;
    }

    const middleware = [offset({ mainAxis: this.distance, crossAxis: this.skidding })];
    if (this.flip) {
      middleware.push(
        flip({
          fallbackStrategy: this.flipFallbackStrategy.replace(/-([a-z])/g, (_, char) => char.toUpperCase()) as any,
        }),
      );
    }
    middleware.push(shift({ padding: this.shiftPadding }));

    const { x, y, placement } = await computePosition(this.popupTriggerRef, this.popupMenuRef, {
      placement: this.placement,
      strategy: this.strategy,
      middleware,
    });

    Object.assign(this.popupMenuRef.style, {
      position: this.strategy,
      left: `${x}px`,
      top: `${y}px`,
    });
    this.popupMenuRef.dataset.placement = placement;
  }

  private handleDocumentClick = (event: MouseEvent) => {
    if (!this.closeOnOutsideClick || !this.open) {
      return;
    }

    const path = event.composedPath();
    if (!path.includes(this.host)) {
      this.setOpen(false, 'outside');
    }
  };

  private handleDocumentKeydown = (event: KeyboardEvent) => {
    if (!this.closeOnEsc || !this.open) {
      return;
    }

    if (event.key === 'Escape') {
      this.setOpen(false, 'escape');
    }
  };

  private setTriggerRef = (el: HTMLDivElement) => {
    this.popupTriggerRef = el;
    this.setupInteractionListeners();
  };

  private setMenuRef = (el: HTMLDivElement) => {
    this.popupMenuRef = el;
  };

  private handleTriggerClick = (event: MouseEvent) => {
    event.stopPropagation();
    this.setOpen(!this.open, 'manual');
  };

  private setupInteractionListeners() {
    if (!this.host) {
      return;
    }

    if (this.detachInteractionListeners) {
      this.detachInteractionListeners();
      this.detachInteractionListeners = undefined;
    }
    if (this.detachHoverClickBlocker) {
      this.detachHoverClickBlocker();
      this.detachHoverClickBlocker = undefined;
    }

    if (this.interaction === 'click') {
      const trigger = this.popupTriggerRef;
      if (!trigger) {
        return;
      }
      trigger.addEventListener('click', this.handleTriggerClick);
      this.detachInteractionListeners = () => {
        trigger.removeEventListener('click', this.handleTriggerClick);
      };
      return;
    }

    if (this.interaction === 'hover') {
      const handleEnter = () => this.setOpen(true, 'manual');
      const handleLeave = () => this.setOpen(false, 'manual');
      const handleFocusOut = (event: FocusEvent) => {
        const nextTarget = event.relatedTarget as Node | null;
        if (!nextTarget || !this.host.contains(nextTarget)) {
          handleLeave();
        }
      };

      const trigger = this.popupTriggerRef;
      if (trigger) {
        const blockClick = (event: MouseEvent) => {
          event.preventDefault();
          event.stopPropagation();
        };
        trigger.addEventListener('click', blockClick);
        this.detachHoverClickBlocker = () => {
          trigger.removeEventListener('click', blockClick);
        };
      }

      this.host.addEventListener('mouseenter', handleEnter);
      this.host.addEventListener('mouseleave', handleLeave);
      this.host.addEventListener('focusin', handleEnter);
      this.host.addEventListener('focusout', handleFocusOut);

      this.detachInteractionListeners = () => {
        this.host.removeEventListener('mouseenter', handleEnter);
        this.host.removeEventListener('mouseleave', handleLeave);
        this.host.removeEventListener('focusin', handleEnter);
        this.host.removeEventListener('focusout', handleFocusOut);
      };
    }
  }

  render() {
    const open = this.open;

    return (
      <Host data-open={open ? 'true' : 'false'}>
        <div class="trigger" ref={this.setTriggerRef} aria-haspopup="dialog" aria-expanded={String(open)} aria-controls={this.popupPanelId} part="trigger">
          <slot name="trigger"></slot>
        </div>
        <div
          id={this.popupPanelId}
          class={{ 'popup': true, 'popup--open': open }}
          role="dialog"
          aria-hidden={open ? 'false' : 'true'}
          ref={this.setMenuRef}
          part="panel"
          data-open={open ? 'true' : 'false'}
        >
          <slot></slot>
        </div>
      </Host>
    );
  }
}
