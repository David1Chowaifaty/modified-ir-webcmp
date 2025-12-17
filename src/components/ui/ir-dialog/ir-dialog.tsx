import { OverflowAdd, OverflowRelease } from '@/decorators/OverflowLock';
import { Component, Element, Event, EventEmitter, Method, Prop, State, h } from '@stencil/core';

@Component({
  tag: 'ir-dialog',
  styleUrl: 'ir-dialog.css',
  shadow: true,
})
export class IrDialog {
  @Element() el: HTMLIrDialogElement;
  /**
   * The dialog's label as displayed in the header.
   * You should always include a relevant label, as it is required for proper accessibility.
   * If you need to display HTML, use the label slot instead.
   */
  @Prop({ reflect: true }) label: string;

  /**
   * Indicates whether or not the dialog is open.
   * Toggle this attribute to show and hide the dialog.
   */
  @Prop({ reflect: true, mutable: true }) open: boolean;

  /**
   * Disables the header.
   * This will also remove the default close button.
   */
  @Prop({ reflect: true, attribute: 'without-header' }) withoutHeader: boolean;

  /**
   * When enabled, the dialog will be closed when the user clicks outside of it.
   */
  @Prop({ attribute: 'light-dismiss' }) lightDismiss: boolean = true;

  /**
   * Emitted when the dialog opens.
   */
  @Event({ bubbles: true, composed: true }) irDialogShow: EventEmitter<void>;

  /**
   * Emitted when the dialog is requested to close.
   * Calling event.preventDefault() will prevent the dialog from closing.
   * You can inspect event.detail.source to see which element caused the dialog to close.
   * If the source is the dialog element itself, the user has pressed Escape or the dialog has been closed programmatically.
   * Avoid using this unless closing the dialog will result in destructive behavior such as data loss.
   */
  @Event({ bubbles: true, composed: true }) irDialogHide: EventEmitter<{ source: Element }>;

  /**
   * Emitted after the dialog opens and all animations are complete.
   */
  @Event({ bubbles: true, composed: true }) irDialogAfterShow: EventEmitter<void>;

  /**
   * Emitted after the dialog closes and all animations are complete.
   */
  @Event({ bubbles: true, composed: true }) irDialogAfterHide: EventEmitter<void>;

  @State() private slotState = new Map<string, boolean>();

  private slotObserver: MutationObserver;

  private readonly SLOT_NAMES = ['label', 'header-actions', 'footer'] as const;

  componentWillLoad() {
    this.updateSlotState();
  }

  componentDidLoad() {
    this.setupSlotListeners();
  }

  disconnectedCallback() {
    this.removeSlotListeners();
  }
  @Method()
  async openModal() {
    this.open = true;
  }

  @Method()
  async closeModal() {
    this.open = false;
  }

  @OverflowRelease()
  private handleWaHide(e: CustomEvent<{ source: Element }>) {
    e.stopImmediatePropagation();
    e.stopPropagation();
    if (!e.detail) {
      return;
    }
    this.open = false;
    this.irDialogHide.emit(e.detail);
  }

  @OverflowAdd()
  private handleWaShow(e: CustomEvent) {
    e.stopImmediatePropagation();
    e.stopPropagation();
    this.open = true;
    this.irDialogShow.emit();
  }

  private handleWaAfterHide(e: CustomEvent) {
    e.stopImmediatePropagation();
    e.stopPropagation();
    this.irDialogAfterHide.emit();
  }

  private handleWaAfterShow(e: CustomEvent) {
    e.stopImmediatePropagation();
    e.stopPropagation();
    this.irDialogAfterShow.emit();
  }
  private setupSlotListeners() {
    // Listen to slotchange events on the host element
    this.el.addEventListener('slotchange', this.handleSlotChange);

    // Also use MutationObserver as a fallback for browsers that don't fire slotchange reliably
    this.slotObserver = new MutationObserver(this.handleSlotChange);
    this.slotObserver.observe(this.el, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['slot'],
    });
  }
  private removeSlotListeners() {
    this.el.removeEventListener('slotchange', this.handleSlotChange);
    this.slotObserver?.disconnect();
  }

  private handleSlotChange = () => {
    this.updateSlotState();
  };

  private updateSlotState() {
    const newState = new Map<string, boolean>();

    this.SLOT_NAMES.forEach(name => {
      newState.set(name, this.hasSlot(name));
    });

    this.slotState = newState;
  }
  private hasSlot(name: string): boolean {
    return !!this.el.querySelector(`[slot="${name}"]`);
  }
  render() {
    return (
      <wa-dialog
        onwa-hide={this.handleWaHide.bind(this)}
        onwa-show={this.handleWaShow.bind(this)}
        onwa-after-hide={this.handleWaAfterHide.bind(this)}
        onwa-after-show={this.handleWaAfterShow.bind(this)}
        label={this.label}
        id="dialog-overview"
        open={this.open}
        style={{ '--width': 'var(--ir-dialog-width,31rem)' }}
        without-header={this.withoutHeader}
        lightDismiss={this.lightDismiss}
        exportparts="dialog, header, header-actions, title, close-button, close-button__base, body, footer"
      >
        {this.slotState.get('header-actions') && <slot name="header-actions" slot="header-actions"></slot>}
        {this.slotState.get('label') && <slot name="label" slot="label"></slot>}
        <slot></slot>
        {this.slotState.get('footer') && <slot name="footer" slot="footer"></slot>}
      </wa-dialog>
    );
  }
}
