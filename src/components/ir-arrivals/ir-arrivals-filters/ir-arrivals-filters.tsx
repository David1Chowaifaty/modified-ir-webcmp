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
        <ir-custom-date-picker class="arrivals-filters__date-picker">
          <wa-icon name="calendar" slot="start"></wa-icon>
          {/* <wa-spinner slot="end"></wa-spinner> */}
        </ir-custom-date-picker>
        <ir-custom-input
          withClear
          class="arrivals-filters__search-bar"
          placeholder="Search guests or bookings"
          value={arrivalsStore.searchTerm}
          onText-change={this.handleSearchChange}
        >
          <wa-icon name="magnifying-glass" slot="start"></wa-icon>
        </ir-custom-input>
      </div>
    );
  }
}
