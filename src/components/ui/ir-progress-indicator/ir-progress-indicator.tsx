import { Component, Host, Prop, h } from '@stencil/core';

@Component({
  tag: 'ir-progress-indicator',
  styleUrl: 'ir-progress-indicator.css',
  scoped: true,
})
export class IrProgressIndicator {
  /**
   * The percentage value to display and fill the progress bar.
   * Example: "75%"
   */
  @Prop() percentage: string;

  /**
   * The color variant of the progress bar.
   * Options:
   * - 'primary' (default)
   * - 'secondary'
   */
  @Prop() color: 'primary' | 'secondary' = 'primary';

  render() {
    return (
      <Host class="progress-main">
        <span class="progress-totle">{this.percentage}</span>
        <div class="progress-line">
          <div class={`progress ${this.color === 'primary' ? 'bg-primary' : 'secondary-progress'} mb-0`} style={{ width: this.percentage }}></div>
        </div>
      </Host>
    );
  }
}
