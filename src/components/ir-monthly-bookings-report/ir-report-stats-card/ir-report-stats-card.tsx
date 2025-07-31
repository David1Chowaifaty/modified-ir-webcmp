import { Component, Host, Prop, h } from '@stencil/core';
import { TIcons } from '@/components/ui/ir-icons/icons';

@Component({
  tag: 'ir-report-stats-card',
  styleUrl: 'ir-report-stats-card.css',
  shadow: false,
})
export class IrReportStatsCard {
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
          <p class="m-0 p-0">{this.cardTitle}</p>
          <ir-icons name={this.icon}></ir-icons>
        </div>
        <h4 class="m-0 p-0">
          <b class="m-0 p-0">{this.value}</b>
        </h4>
        {this.subtitle && <p class="m-0 p-0 small text-muted">{this.subtitle}</p>}
      </Host>
    );
  }
}
