import { departuresStore, setDeparturesReferenceDate, setDeparturesSearchTerm } from '@/stores/departures.store';
import { Component, h } from '@stencil/core';

@Component({
  tag: 'ir-departures-filter',
  styleUrl: 'ir-departures-filter.css',
  scoped: true,
})
export class IrDeparturesFilter {
  private handleSearchChange = (event: CustomEvent<string>) => {
    setDeparturesSearchTerm(event.detail ?? '');
  };

  render() {
    return (
      <div class="departures-filters__container">
        <ir-custom-date-picker
          onDateChanged={e => {
            e.stopImmediatePropagation();
            e.stopPropagation();
            setDeparturesReferenceDate(e.detail.start.format('YYYY-MM-DD'));
          }}
          date={departuresStore.today}
          class="departures-filters__date-picker"
        >
          <wa-icon name="calendar" slot="start"></wa-icon>
          <wa-spinner slot="end"></wa-spinner>
        </ir-custom-date-picker>
        <ir-custom-input
          withClear
          class="departures-filters__search-bar"
          placeholder="Search guests or bookings"
          value={departuresStore.searchTerm}
          onText-change={this.handleSearchChange}
        >
          <wa-icon name="magnifying-glass" slot="start"></wa-icon>
        </ir-custom-input>
      </div>
    );
  }
}
