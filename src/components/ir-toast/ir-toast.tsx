import { Component, Fragment, Host, Element, Listen, Method, Prop, State, h } from '@stencil/core';
import { TPositions, IToast } from './toast';

@Component({
  tag: 'ir-toast',
  styleUrl: 'ir-toast.css',
  scoped: true,
})
export class IrToast {
  @Prop({ reflect: true, mutable: true }) position: TPositions = 'bottom-left';
  @State() isVisible = false;
  @State() isFocused = false;
  @Element() element: HTMLElement;
  private toastRef: HTMLElement;
  private duration = 5000;
  private showToastTimeOut: any;
  private toastBody: IToast = { description: '', type: 'success' };
  applyStyles(style: Partial<CSSStyleDeclaration>) {
    for (const property in style) {
      if (style.hasOwnProperty(property)) {
        this.toastRef.style[property] = style[property];
      }
    }
  }
  @Listen('toast', { target: 'body' })
  onToast(event: CustomEvent<IToast>) {
    event.stopImmediatePropagation();
    event.stopPropagation();
    const { duration, position, style } = event.detail;
    this.toastBody = event.detail;
    if (position) {
      this.position = position;
    }
    if (duration) {
      this.duration = duration;
    }
    if (style) {
      this.applyStyles(style);
    }
    this.showToast();
    this.setToastTimeout();
  }
  setToastTimeout() {
    this.showToastTimeOut = setTimeout(() => {
      this.hideToast();
    }, this.duration);
  }
  clearToastTimeout() {
    if (this.showToastTimeOut) {
      clearTimeout(this.showToastTimeOut);
      this.showToastTimeOut = undefined;
    }
  }
  @Method()
  async hideToast() {
    this.clearToastTimeout();
    this.toastRef.setAttribute('data-state', 'close');
    this.toastRef.style.opacity = '0';
    this.isVisible = false;
  }
  @Method()
  async showToast() {
    this.clearToastTimeout();
    this.toastRef.style.opacity = '1';
    this.toastRef.setAttribute('data-state', 'open');
    this.isVisible = true;
  }
  disconnectedCallback() {
    this.clearToastTimeout();
  }
  renderIcon() {
    switch (this.toastBody.type) {
      case 'success':
        return (
          <div class="icon-container success">
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M11.4669 3.72684C11.7558 3.91574 11.8369 4.30308 11.648 4.59198L7.39799 11.092C7.29783 11.2452 7.13556 11.3467 6.95402 11.3699C6.77247 11.3931 6.58989 11.3355 6.45446 11.2124L3.70446 8.71241C3.44905 8.48022 3.43023 8.08494 3.66242 7.82953C3.89461 7.57412 4.28989 7.55529 4.5453 7.78749L6.75292 9.79441L10.6018 3.90792C10.7907 3.61902 11.178 3.53795 11.4669 3.72684Z"
                fill="currentColor"
                fill-rule="evenodd"
                clip-rule="evenodd"
              ></path>
            </svg>
          </div>
        );
      case 'error':
        return (
          <div class="icon-container error">
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z"
                fill="currentColor"
                fill-rule="evenodd"
                clip-rule="evenodd"
              ></path>
            </svg>
          </div>
        );
      default:
        return null;
    }
  }
  render() {
    return (
      <Host>
        <section aria-live="off" role="status" aria-atomic="true" ref={el => (this.toastRef = el)} class={`ToastRoot`}>
          {this.isVisible && (
            <Fragment>
              {this.toastBody.type === 'custom' ? (
                this.toastBody.body
              ) : (
                <Fragment>
                  {this.toastBody.title !== '' && <h3 class="ToastTitle">{this.toastBody.title}</h3>}
                  {this.toastBody.description !== '' && <p class="ToastDescription">{this.toastBody.description}</p>}
                  {this.renderIcon()}
                </Fragment>
              )}
            </Fragment>
          )}
        </section>
      </Host>
    );
  }
}
