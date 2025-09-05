import { Component, Host, Prop, h } from '@stencil/core';
import { TIcons } from '@/components/ui/ir-icons/icons';
@Component({
  tag: 'ir-stats-card',
  styleUrl: 'ir-stats-card.css',
  scoped: true,
})
export class IrStatsCard {
  @Prop() icon: TIcons;
  @Prop() cardTitle: string;
  @Prop() subtitle: string;
  @Prop() value: string;
  render() {
    if (!this.value) {
      return null;
    }
    return (
      <Host class="card p-1 d-flex flex-column flex-fill m-0" style={{ gap: '0.5rem' }}>
        <div class="d-flex align-items-center justify-content-between">
          <slot slot="card-header">
            <p class="m-0 p-0">
              <slot name="title">{this.cardTitle}</slot>
            </p>
            <ir-icons name={this.icon}></ir-icons>
          </slot>
        </div>
        <slot name="card-body">
          <h4 class="m-0 p-0">
            <b class="m-0 p-0">
              <slot name="value">{this.value}</slot>
            </b>
          </h4>
        </slot>
        <slot name="card-footer">
          {this.subtitle && (
            <p class="m-0 p-0 small text-muted">
              <slot name="subtitle">{this.subtitle}</slot>
            </p>
          )}
        </slot>
      </Host>
    );
  }
}
