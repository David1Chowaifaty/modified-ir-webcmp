import housekeeping_store from '@/stores/housekeeping.store';
import { Component, Host, h } from '@stencil/core';

@Component({
  tag: 'ir-hk-team',
  styleUrl: 'ir-hk-team.css',
  scoped: true,
})
export class IrHkTeam {
  render() {
    return (
      <Host class="card p-1">
        <section>
          <div>
            <h4>Room or Unit Status</h4>
            <div></div>
          </div>
          <p>As an option,create housekeepers</p>
        </section>
        <section></section>
      </Host>
    );
  }
}
