import calendar_data from '@/stores/calendar-data';
import { Component, Host, h } from '@stencil/core';

@Component({
  tag: 'ir-channel-mapping',
  styleUrl: 'ir-channel-mapping.css',
  scoped: true,
})
export class IrChannelMapping {
  render() {
    return (
      <Host>
        <ul class="m-0 p-0">
          {calendar_data.channels[0].property.room_types.map(property => (
            <li class="map-row" key={property.id}>
              <span>{property.name}</span>

              <svg xmlns="http://www.w3.org/2000/svg" height="14" width="12.25" viewBox="0 0 448 512">
                <path d="M438.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-160-160c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L338.8 224 32 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l306.7 0L233.4 393.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l160-160z" />
              </svg>
              <span class="mapped-to-text">not mapped</span>
            </li>
          ))}
        </ul>
      </Host>
    );
  }
}
