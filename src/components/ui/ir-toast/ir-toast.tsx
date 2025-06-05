import { Component, Host, Element, Listen, Prop, h, State } from '@stencil/core';
import { TPositions, IToast } from './toast';

@Component({
  tag: 'ir-toast',
  styleUrl: 'ir-toast.css',
  scoped: true,
})
export class IrToast {
  @Element() element: HTMLElement;

  /**
   * Position where toasts will appear.
   * Options include: `'top-left'`, `'top-right'`, `'bottom-left'`, `'bottom-right'`.
   */
  @Prop({ reflect: true, mutable: true }) position: TPositions = 'bottom-left';

  /**
   * Array of active toast messages.
   */
  @State() toasts: IToast[] = [];

  @Listen('toast', { target: 'body' })
  onToast(event: CustomEvent<IToast>) {
    const toast: IToast = event.detail;
    this.showToast(toast);
  }

  private showToast(toast: IToast) {
    const toastrOptions = {
      positionClass: 'toast-top-right',
      closeButton: true,
      timeOut: toast.duration || 5000,
    };

    switch (toast.type) {
      case 'success':
        toastr.success(toast.title, '', toastrOptions);
        break;
      case 'error':
        toastr.error(toast.title, '', toastrOptions);
        break;
    }
  }

  render() {
    return <Host></Host>;
  }
}
