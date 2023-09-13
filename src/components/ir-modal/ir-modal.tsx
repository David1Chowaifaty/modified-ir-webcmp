import { Component, h, State, Method, Event, EventEmitter, Prop, Listen } from '@stencil/core';

@Component({
  tag: 'ir-modal',
  styleUrl: 'ir-modal.css',
})
export class IrModal {
  @Prop() modalTitle: string = 'Modal Title';
  @Prop() modalBody: string = 'Modal Body';

  @Prop() rightBtnActive: boolean = true;
  @Prop() leftBtnActive: boolean = true;

  @Prop() rightBtnText: string = 'Close';
  @Prop() leftBtnText: string = 'Confirm';

  @Prop() rightBtnColor: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark' = 'primary';
  @Prop() leftBtnColor: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark' = 'secondary';

  @Prop() btnPosition: 'left' | 'right' | 'center' = 'right';
  @Prop() iconAvailable: boolean = false;
  @Prop() icon: string = '';

  @State() isOpen: boolean = false;

  @Method()
  async closeModal() {
    this.isOpen = false;
  }
  @Method()
  async openModal() {
    this.isOpen = true;
  }
  @Event({ bubbles: true, composed: true }) confirmModal: EventEmitter<any>;
  @Event({ bubbles: true, composed: true }) cancelModal: EventEmitter<any>;

  @Listen('clickHanlder')
  btnClickHandler(event: CustomEvent) {
    let target = event.target as HTMLInputElement;
    let name = target.name;

    if (name === this.leftBtnText) {
      this.confirmModal.emit(this.item);
    } else if (name === this.rightBtnText) {
      this.cancelModal.emit();
      this.closeModal();
    }
  }

  @Prop({ reflect: true }) item: any = {};

  render() {
    return [
      <div
        class={`backdropModal ${this.isOpen ? 'active' : ''}`}
        onClick={() => {
          this.closeModal();
        }}
      ></div>,
      <div class={`ir-modal  ${this.isOpen ? 'active' : ''}`} tabindex="-1">
        <div class="modal-dialog">
          <div class={` modal-content`}>
            <div class={`modal-header align-items-center`}>
              <div class="font-weight-bold d-flex align-items-center">
                {this.iconAvailable && <ir-icon class="mr-1" icon={this.icon}></ir-icon>} {this.modalTitle}
              </div>
              <div class="font-weight-bold d-flex align-items-center font-size-large">
                <ir-icon icon="ft-x" style={{ cursor: 'pointer' }} onClick={() => this.closeModal()}></ir-icon>
              </div>
            </div>
            <div class="modal-body">
              <div>{this.modalBody}</div>
            </div>

            <div class={`modal-footer d-flex justify-content-${this.btnPosition === 'center' ? 'center' : this.btnPosition === 'left' ? 'start' : 'end'}`}>
              {this.leftBtnActive && <ir-button icon={''} btn_color={this.leftBtnColor} btn_block text={this.leftBtnText} name={this.leftBtnText}></ir-button>}
              {this.rightBtnActive && <ir-button icon={''} btn_color={this.rightBtnColor} btn_block text={this.rightBtnText} name={this.rightBtnText}></ir-button>}
            </div>
          </div>
        </div>
      </div>,
    ];
  }
}
