import { arrivalsStore, setArrivalsSearchTerm } from '@/stores/arrivals.store';
import { Component, h } from '@stencil/core';

@Component({
  tag: 'ir-arrivals-filters',
  styleUrl: 'ir-arrivals-filters.css',
  scoped: true,
})
export class IrArrivalsFilters {
  private handleSearchChange = (event: CustomEvent<string>) => {
    setArrivalsSearchTerm(event.detail ?? '');
  };

  render() {
    return (
      <div class="arrivals-filters__container">
        <ir-custom-date-picker></ir-custom-date-picker>
        <ir-custom-input
          placeholder="Search name or booking number"
          value={arrivalsStore.searchTerm}
          onText-change={this.handleSearchChange}
        >
          <wa-icon name="magnifying-glass" slot="start"></wa-icon>
        </ir-custom-input>
      </div>
    );
  }
}
