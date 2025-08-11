import { SlDialog, SlRequestCloseEvent } from '@shoelace-style/shoelace';
import { Component, h, Method, Event, EventEmitter, Prop } from '@stencil/core';

@Component({
  tag: 'ir-modal',
  styleUrl: 'ir-modal.css',
  scoped: true,
})
export class IrModal {
  /**
   * The title text displayed in the modal header.
   */
  @Prop() modalTitle: string = 'Modal Title';

  /**
   * The main content text shown in the modal body.
   */
  @Prop() modalBody: string = 'Modal Body';

  /**
   * Controls whether the modal title is rendered.
   */
  @Prop() showTitle: boolean;

  /**
   * Whether the right (confirm) button is visible.
   */
  @Prop() rightBtnActive: boolean = true;

  /**
   * Whether the left (cancel/close) button is visible.
   */
  @Prop() leftBtnActive: boolean = true;

  /**
   * Text displayed on the right (confirm) button.
   */
  @Prop() rightBtnText: string = 'Confirm';

  /**
   * Text displayed on the left (cancel/close) button.
   */
  @Prop() leftBtnText: string = 'Close';

  /**
   * Whether the modal is in a loading state, disabling interaction.
   */
  @Prop() isLoading: boolean = false;

  /**
   * If true, the modal automatically closes after confirm/cancel actions.
   */
  @Prop() autoClose: boolean = true;

  /**
   * Color theme of the right button.
   */
  @Prop() rightBtnColor: 'default' | 'primary' | 'success' | 'neutral' | 'warning' | 'danger' | 'text' = 'primary';

  /**
   * Color theme of the left button.
   */
  @Prop() leftBtnColor: 'default' | 'primary' | 'success' | 'neutral' | 'warning' | 'danger' | 'text' = 'default';

  /**
   * Horizontal alignment of the footer buttons.
   */
  @Prop() btnPosition: 'left' | 'right' | 'center' = 'right';

  /**
   * Whether an icon should be displayed next to the title.
   */
  @Prop() iconAvailable: boolean = false;

  /**
   * Icon name to render next to the title (if `iconAvailable` is true).
   */
  @Prop() icon: string = '';

  /**
   * Payload object to pass along with confirm/cancel events.
   */
  @Prop({ mutable: true }) item: any = {};

  private dialogEl: SlDialog;

  componentDidLoad() {
    this.dialogEl.addEventListener('sl-request-close', this.handleDialogRequestCloseEvent.bind(this));
  }
  disconnectedCallback() {
    this.dialogEl.removeEventListener('sl-request-close', this.handleDialogRequestCloseEvent.bind(this));
  }

  private handleDialogRequestCloseEvent = (e: SlRequestCloseEvent) => {
    if (e.detail.source === 'close-button') {
      this.cancelModal.emit();
    }
  };

  /**
   * Opens the modal.
   *
   * Example:
   * ```ts
   * const modal = document.querySelector('ir-modal');
   * modal.openModal();
   * ```
   */
  @Method()
  async openModal() {
    // this.isOpen = true;
    this.dialogEl.show();
  }

  /**
   * Closes the modal.
   */
  @Method()
  async closeModal() {
    this.dialogEl.hide();
    // this.isOpen = false;
  }

  /**
   * Fired when the confirm (right) button is clicked.
   * Emits the current `item` value.
   */
  @Event({ bubbles: true, composed: true }) confirmModal: EventEmitter<any>;

  /**
   * Fired when the cancel (left) button or backdrop is clicked.
   */
  @Event({ bubbles: true, composed: true }) cancelModal: EventEmitter<any>;

  render() {
    return [
      <sl-dialog label={this.showTitle ? this.modalTitle : undefined} ref={el => (this.dialogEl = el)} class="dialog-overview">
        {this.modalBody}
        <div slot="footer" class="dialog-footer">
          <sl-button
            variant={this.leftBtnColor}
            onclick={() => {
              this.closeModal();
              this.cancelModal.emit();
            }}
            disabled={!this.leftBtnActive}
          >
            {this.leftBtnText}
          </sl-button>
          <sl-button
            loading={this.isLoading}
            disabled={!this.rightBtnActive}
            variant={this.rightBtnColor}
            onclick={() => {
              this.confirmModal.emit(this.item);
              this.item = {};
              if (this.autoClose) {
                this.closeModal();
              }
            }}
          >
            {this.rightBtnText}
          </sl-button>
        </div>
      </sl-dialog>,
    ];
  }
}
