import { Component, Host, h, Element, Method, State, Event, EventEmitter, Prop, Watch } from '@stencil/core';

@Component({
  tag: 'ir-dialog',
  styleUrl: 'ir-dialog.css',
  shadow: true,
})
export class IrDialog {
  private static dialogIds = 0;

  @Element() hostEl!: HTMLElement;

  /**
   * Controls whether the dialog is open. Reflects to the host attribute for CSS hooks.
   */
  @Prop({ mutable: true, reflect: true }) open = false;

  /**
   * Emits when the open state changes due to user interaction or programmatic control.
   */
  @Event() openChange: EventEmitter<boolean>;

  @State() private hasTitleSlot = false;
  @State() private hasBodySlot = false;

  private dialogEl?: HTMLDialogElement;
  private previouslyFocused: HTMLElement | null = null;
  private readonly instanceId = ++IrDialog.dialogIds;

  private get titleId() {
    return `ir-dialog-title-${this.instanceId}`;
  }

  private get descriptionId() {
    return `ir-dialog-description-${this.instanceId}`;
  }

  componentDidLoad() {
    if (!this.dialogEl) {
      return;
    }

    this.dialogEl.addEventListener('cancel', this.handleCancel);
    this.dialogEl.addEventListener('close', this.handleNativeClose);

    this.syncSlotState();

    if (this.open) {
      this.showDialog(false);
    }
  }

  disconnectedCallback() {
    if (this.dialogEl) {
      this.dialogEl.removeEventListener('cancel', this.handleCancel);
      this.dialogEl.removeEventListener('close', this.handleNativeClose);
    }
    this.restoreFocus();
  }

  @Watch('open')
  protected handleOpenChange(open: boolean) {
    if (open) {
      this.showDialog();
    } else {
      this.hideDialog();
    }
  }

  /**
   * Opens the dialog programmatically using the native `showModal` API.
   */
  @Method()
  async openModal() {
    this.open = true;
  }

  /**
   * Closes the dialog programmatically and restores focus to the previously active element.
   */
  @Method()
  async closeModal() {
    this.open = false;
  }

  private showDialog(emit = true) {
    if (!this.dialogEl || this.dialogEl.open) {
      return;
    }

    this.previouslyFocused = document.activeElement as HTMLElement;

    if (typeof this.dialogEl.showModal === 'function') {
      this.dialogEl.showModal();
    } else {
      this.dialogEl.setAttribute('open', '');
    }

    if (emit) {
      this.openChange.emit(true);
    }
  }

  private hideDialog(emit = true) {
    if (!this.dialogEl) {
      return;
    }

    if (this.dialogEl.open) {
      this.dialogEl.close();
    }

    this.restoreFocus();

    if (emit) {
      this.openChange.emit(false);
    }
  }

  private handleCancel = (event: Event) => {
    event.preventDefault();
    this.closeModal();
  };

  private handleNativeClose = () => {
    if (this.open) {
      // Ensure the public prop stays in sync when the native dialog closes (e.g. via form submission).
      this.open = false;
      return;
    }

    this.hideDialog(false);
  };

  private restoreFocus() {
    if (this.previouslyFocused && typeof this.previouslyFocused.focus === 'function') {
      this.previouslyFocused.focus({ preventScroll: true });
    }
    this.previouslyFocused = null;
  }

  private onTitleSlotChange = (event: Event) => {
    const slot = event.target as HTMLSlotElement;
    this.hasTitleSlot = slot.assignedNodes({ flatten: true }).length > 0;
  };

  private onBodySlotChange = (event: Event) => {
    const slot = event.target as HTMLSlotElement;
    this.hasBodySlot = slot.assignedNodes({ flatten: true }).length > 0;
  };

  private onCloseButtonClick = () => {
    this.closeModal();
  };

  private syncSlotState() {
    if (!this.dialogEl) {
      return;
    }

    const titleSlot = this.dialogEl.querySelector('slot[name="modal-title"]') as HTMLSlotElement | null;
    const bodySlot = this.dialogEl.querySelector('slot[name="modal-body"]') as HTMLSlotElement | null;

    if (titleSlot) {
      this.hasTitleSlot = titleSlot.assignedNodes({ flatten: true }).length > 0;
    }

    if (bodySlot) {
      this.hasBodySlot = bodySlot.assignedNodes({ flatten: true }).length > 0;
    }
  }

  render() {
    const labelledBy = this.hasTitleSlot ? this.titleId : undefined;
    const describedBy = this.hasBodySlot ? this.descriptionId : undefined;

    return (
      <Host>
        <dialog
          ref={el => (this.dialogEl = el as HTMLDialogElement)}
          class="dialog"
          role="dialog"
          aria-modal="true"
          aria-labelledby={labelledBy}
          aria-describedby={describedBy}
        >
          <div class="dialog__content" role="document">
            <header class="dialog__header" id={labelledBy}>
              <slot name="modal-title" onSlotchange={this.onTitleSlotChange}></slot>
              <button type="button" class="dialog__close-button" onClick={this.onCloseButtonClick} aria-label="Close dialog">
                <slot name="close-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" height={18} width={18} aria-hidden="true" focusable="false">
                    <path
                      fill="currentColor"
                      d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"
                    />
                  </svg>
                </slot>
              </button>
            </header>
            <section class="dialog__body" id={describedBy}>
              <slot name="modal-body" onSlotchange={this.onBodySlotChange}></slot>
            </section>
            <footer class="dialog__footer">
              <slot name="modal-footer"></slot>
            </footer>
          </div>
        </dialog>
      </Host>
    );
  }
}
