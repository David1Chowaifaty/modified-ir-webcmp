import { Component, h, State, Method, Event, EventEmitter, Prop, Listen } from '@stencil/core';

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
  @Prop() rightBtnColor: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark' = 'primary';

  /**
   * Color theme of the left button.
   */
  @Prop() leftBtnColor: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark' = 'secondary';

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
   * Controls visibility of the modal.
   */
  @State() isOpen: boolean = false;

  /**
   * Payload object to pass along with confirm/cancel events.
   */
  @Prop({ mutable: true }) item: any = {};

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
    this.isOpen = true;
  }

  /**
   * Closes the modal.
   */
  @Method()
  async closeModal() {
    this.isOpen = false;
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

  @Listen('clickHandler')
  btnClickHandler(event: CustomEvent) {
    let target = event.target as HTMLInputElement;
    let name = target.name;

    if (name === this.leftBtnText) {
      this.cancelModal.emit();
      this.item = {};
      this.closeModal();
    } else if (name === this.rightBtnText) {
      this.confirmModal.emit(this.item);
      this.item = {};
      if (this.autoClose) {
        this.closeModal();
      }
    }
  }

  render() {
    return [
      <div
        class={`backdropModal ${this.isOpen ? 'active' : ''}`}
        onClick={() => {
          this.cancelModal.emit();
          if (this.autoClose && !this.isLoading) {
            this.closeModal();
          }
        }}
      ></div>,
      <div data-state={this.isOpen ? 'opened' : 'closed'} class={`ir-modal`} tabindex="-1">
        <div class={`ir-alert-content p-2`}>
          {this.showTitle && (
            <div class={`ir-alert-header`}>
              {/*
            <p class="font-weight-bold p-0 my-0 mb-1">
              {this.iconAvailable && <ir-icon class="mr-1" icon={this.icon}></ir-icon>} 
               {this.modalBody} 
              {this.modalTitle}
            </p>
            */}
              {/* <div class="font-weight-bold d-flex align-items-center font-size-large my-0 py-0">
              <ir-icon
                icon="ft-x"
                style={{ cursor: 'pointer' }}
                onClick={() => {
                  this.closeModal();
                  this.cancelModal.emit();
                }}
              ></ir-icon>
            </div> */}
              <p>{this.modalTitle}</p>
            </div>
          )}
          <div class="modal-body text-left p-0 mb-2">
            <div>{this.modalBody}</div>
          </div>

          <div class={`ir-alert-footer border-0  d-flex justify-content-${this.btnPosition === 'center' ? 'center' : this.btnPosition === 'left' ? 'start' : 'end'}`}>
            {this.leftBtnActive && <ir-button btn_disabled={this.isLoading} btn_color={this.leftBtnColor} btn_block text={this.leftBtnText} name={this.leftBtnText}></ir-button>}
            {this.rightBtnActive && (
              <ir-button
                btn_color={this.rightBtnColor}
                btn_disabled={this.isLoading}
                isLoading={this.isLoading}
                btn_block
                text={this.rightBtnText}
                name={this.rightBtnText}
              ></ir-button>
            )}
          </div>
        </div>
      </div>,
    ];
  }
}
