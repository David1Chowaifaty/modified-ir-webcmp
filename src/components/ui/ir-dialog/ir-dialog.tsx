import { Component, Host, h, Element, Method, Listen, State, Event, EventEmitter, Prop, Watch } from '@stencil/core';

@Component({
  tag: 'ir-dialog',
  styleUrl: 'ir-dialog.css',
  shadow: true,
})
export class IrDialog {
  @Prop() open: boolean = false;
  @Element() el: HTMLElement;
  private firstFocusableElement: HTMLElement;
  private lastFocusableElement: HTMLElement;

  @State() isOpen = false;
  @Event() openChange: EventEmitter<boolean>;
  componentWillLoad() {
    if (this.open) {
      this.openModal();
    }
  }
  componentDidLoad() {
    this.prepareFocusTrap();
  }

  @Method()
  async openModal() {
    this.isOpen = true;
    document.body.style.overflow = 'hidden';
    setTimeout(() => {
      this.prepareFocusTrap();
    }, 10);
    this.openChange.emit(this.isOpen);
  }

  @Method()
  async closeModal() {
    console.log('close');
    if (!this.isOpen) {
      return;
    }
    document.body.style.overflow = 'visible';
    this.isOpen = false;
    this.openChange.emit(this.isOpen);
  }

  @Watch('open')
  handleOpenChange() {
    if (this.open) {
      this.openModal();
    } else {
      this.closeModal();
    }
  }

  prepareFocusTrap() {
    const focusableElements = 'button,ir-dropdown ,[href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    const focusableContent: NodeListOf<HTMLElement> = this.el.shadowRoot.querySelectorAll(focusableElements);
    // console.log(focusableContent);
    if (focusableContent.length === 0) return;
    this.firstFocusableElement = focusableContent[0];
    this.lastFocusableElement = focusableContent[focusableContent.length - 1];
    this.firstFocusableElement.focus();
  }

  @Listen('keydown', { target: 'window' })
  handleKeyDown(ev: KeyboardEvent) {
    if (!this.isOpen) {
      return;
    }

    let isTabPressed = ev.key === 'Tab';
    if (ev.key === 'Escape' && this.isOpen) {
      this.closeModal();
    }
    if (!isTabPressed) {
      return;
    }

    // If focus is about to leave the last focusable element, redirect it to the first.
    if (!ev.shiftKey && document.activeElement === this.lastFocusableElement) {
      this.firstFocusableElement.focus();
      ev.preventDefault();
    }

    // If focus is about to leave the first focusable element, redirect it to the last.
    if (ev.shiftKey && document.activeElement === this.firstFocusableElement) {
      this.lastFocusableElement.focus();
      ev.preventDefault();
    }
  }

  disconnectedCallback() {
    document.body.style.overflow = 'visible';
  }

  render() {
    return (
      <Host>
        <div class="backdrop" data-state={this.isOpen ? 'opened' : 'closed'} onClick={() => this.closeModal()}></div>
        {this.isOpen && (
          <div class="modal-container" tabIndex={-1} role="dialog" aria-labelledby="dialog1Title" aria-describedby="dialog1Desc">
            <ir-icon id="close" class="dialog-close-button" onIconClickHandler={() => this.closeModal()}>
              <svg slot="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" height={18} width={18}>
                <path
                  fill="#104064"
                  class="currentColor"
                  d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"
                />
              </svg>
            </ir-icon>
            <div class={'modal-title'} id="dialog1Title">
              <slot name="modal-title"></slot>
            </div>
            <div class="modal-body" id="dialog1Desc">
              <slot name="modal-body"></slot>
            </div>
            <div class="modal-footer">
              <slot name="modal-footer"></slot>
            </div>
          </div>
        )}
      </Host>
    );
  }
}
