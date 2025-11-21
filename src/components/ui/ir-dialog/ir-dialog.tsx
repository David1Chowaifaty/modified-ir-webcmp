import { OverflowAdd, OverflowRelease } from '@/decorators/OverflowLock';
import { Component, Event, EventEmitter, Method, Prop, h } from '@stencil/core';

@Component({
  tag: 'ir-dialog',
  styleUrls: ['ir-dialog.css', '../../../global/app.css'],
  shadow: false,
})
export class IrDialog {
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
        without-header={this.withoutHeader}
        lightDismiss={this.lightDismiss}
      >
        <slot name="header-actions" slot="header-actions"></slot>
        <slot name="label" slot="label"></slot>
        <slot></slot>
        <slot name="footer" slot="footer"></slot>
      </wa-dialog>
    );
  }
}
