import { Component, Host, Prop, Event, EventEmitter, h } from '@stencil/core';

export type IrActionButton = 'check_in' | 'check_out' | 'overdue_check_in' | 'overdue_check_out' | 'edit' | 'delete';

@Component({
  tag: 'ir-actions-cell',
  styleUrl: 'ir-actions-cell.css',
  scoped: true,
})
export class IrActionsCell {
  @Prop() buttons: IrActionButton[] = [];

  @Event() irAction: EventEmitter<{ action: IrActionButton }>;

  private getLabel(type: IrActionButton): string {
    switch (type) {
      case 'check_in':
        return 'Check in';
      case 'check_out':
        return 'Check out';
      case 'overdue_check_in':
        return 'Overdue check-in';
      case 'overdue_check_out':
        return 'Overdue check-out';
      case 'edit':
        return 'icon';
      case 'delete':
        return 'icon';
      default:
        return '';
    }
  }
  private getVariant(type: IrActionButton): HTMLIrCustomButtonElement['variant'] {
    switch (type) {
      case 'overdue_check_in':
      case 'overdue_check_out':
        return 'neutral';
      case 'edit':
        return 'neutral';
      case 'delete':
        return 'danger';
      default:
        return 'brand';
    }
  }
  private getAppearance(type: IrActionButton): HTMLIrCustomButtonElement['appearance'] {
    switch (type) {
      case 'edit':
      case 'delete':
        return 'plain';
      default:
        return 'accent';
    }
  }

  private onClick(action: IrActionButton) {
    this.irAction.emit({ action });
  }

  private renderButton(type: IrActionButton) {
    const label = this.getLabel(type);
    const variant = this.getVariant(type);
    const appearance = this.getAppearance(type);
    if (!label) return null;

    return (
      <ir-custom-button variant={variant} appearance={appearance} data-action={type} onClick={() => this.onClick(type)}>
        {label !== 'icon' && label}
        {type === 'edit' && <wa-icon name="edit" style={{ fontSize: '1.2rem' }}></wa-icon>}
        {type === 'delete' && <wa-icon name="trash-can" style={{ fontSize: '1.2rem' }}></wa-icon>}
      </ir-custom-button>
    );
  }

  render() {
    return <Host>{this.buttons.map(button => this.renderButton(button))}</Host>;
  }
}
