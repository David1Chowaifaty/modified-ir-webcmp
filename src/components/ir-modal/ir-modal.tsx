import { Component, h, State, Method, Event, EventEmitter, Prop, Listen } from '@stencil/core';

@Component({
  tag: 'ir-modal',
  styleUrl: 'ir-modal.css',
  scoped: true,
})
export class IrModal {
  @Prop() modalTitle: string = 'Modal Title';
  @Prop() modalBody: string = 'Modal Body';

  @Prop() rightBtnActive: boolean = true;
  @Prop() leftBtnActive: boolean = true;

  @Prop() rightBtnText: string = 'Confirm';
  @Prop() leftBtnText: string = 'Close';

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
      this.cancelModal.emit();
      this.item = {};
      this.closeModal();
    } else if (name === this.rightBtnText) {
      this.confirmModal.emit(this.item);
      this.item = {};
      this.closeModal();
    }
  }

  @Prop({ mutable: true }) item: any = {};

  render() {
    return [
      <div
        class={`backdropModal ${this.isOpen ? 'active' : ''}`}
        onClick={() => {
          this.closeModal();
        }}
      ></div>,
      <div data-state={this.isOpen ? 'opened' : 'closed'} class={`ir-modal`} tabindex="-1">
        <div class={`ir-alert-content p-2`}>
          <div class={`ir-alert-header align-items-center border-0 py-0 m-0 `}>
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
          </div>
          <div class="modal-body text-left p-0 mb-2">
            <div>{this.modalBody}</div>
          </div>

          <div class={`ir-alert-footer border-0  d-flex justify-content-${this.btnPosition === 'center' ? 'center' : this.btnPosition === 'left' ? 'start' : 'end'}`}>
            {this.leftBtnActive && <ir-button icon={''} btn_color={this.leftBtnColor} btn_block text={this.leftBtnText} name={this.leftBtnText}></ir-button>}
            {this.rightBtnActive && <ir-button icon={''} btn_color={this.rightBtnColor} btn_block text={this.rightBtnText} name={this.rightBtnText}></ir-button>}
          </div>
        </div>
      </div>,
    ];
  }
}
