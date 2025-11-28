import { Component, h } from '@stencil/core';

@Component({
  tag: 'ir-arrivals-filters',
  styleUrl: 'ir-arrivals-filters.css',
  scoped: true,
})
export class IrArrivalsFilters {
  render() {
    return (
      <div class="arrivals-filters__container">
        <ir-custom-date-picker></ir-custom-date-picker>
        <ir-custom-input label="Lol">
          <wa-icon name="magnifying-glass" slot="start"></wa-icon>
        </ir-custom-input>
      </div>
    );
  }
}
