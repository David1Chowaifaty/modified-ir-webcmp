import { Component, Host, State, h } from '@stencil/core';
import { IrMappingService } from './ir-mapping.service';
import channels_data, { addMapping } from '@/stores/channel.store';

@Component({
  tag: 'ir-channel-mapping',
  styleUrl: 'ir-channel-mapping.css',
  scoped: true,
})
export class IrChannelMapping {
  @State() activeMapField = '';
  @State() availableRooms: { id: string; name: string }[] = [];

  private mappingService = new IrMappingService();

  setActiveField(id: string, isRoomType: boolean, roomTypeId?: string) {
    const availableRooms = this.mappingService.getAppropriateRooms(isRoomType, roomTypeId);
    if (availableRooms) {
      this.availableRooms = availableRooms;
    }
    this.activeMapField = id;
  }

  renderMappingStatus(id: string, isRoomType: boolean, roomTypeId?: string) {
    const mappedField = this.mappingService.checkMappingExists(id);
    if (mappedField) {
      return <span class="px-2">{mappedField.ir_id}</span>;
    }
    return (
      <span class="px-2">
        {this.activeMapField === id ? (
          <ir-combobox
            autoFocus
            placeholder="Not mapped"
            data={this.availableRooms}
            onComboboxValueChange={e => {
              addMapping(e.detail.data as string, this.activeMapField);
              this.activeMapField = '';
            }}
          ></ir-combobox>
        ) : (
          <span class="cursor-pointer text-red" onClick={() => this.setActiveField(id, isRoomType, roomTypeId)}>
            Not mapped
          </span>
        )}
      </span>
    );
  }
  render() {
    return (
      <Host>
        <ul class="m-0 p-0">
          <li class="map-row my-2">
            <span class="font-weight-bold">{channels_data.selectedChannel.name}</span>
            <svg xmlns="http://www.w3.org/2000/svg" height="14" width="12.25" viewBox="0 0 448 512">
              <path d="M438.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-160-160c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L338.8 224 32 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l306.7 0L233.4 393.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l160-160z" />
            </svg>
            <span class="font-weight-bold px-2">Channel manager</span>
          </li>
          {channels_data.selectedChannel.property.room_types.map(room_type => (
            <li key={room_type.id} class="mb-1">
              <div class="map-row">
                <span>{room_type.name}</span>
                <svg xmlns="http://www.w3.org/2000/svg" height="14" width="12.25" viewBox="0 0 448 512">
                  <path d="M438.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-160-160c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L338.8 224 32 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l306.7 0L233.4 393.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l160-160z" />
                </svg>
                {this.renderMappingStatus(room_type.id, true)}
              </div>
              <ul class="m-0 p-0">
                {room_type.rate_plans.map(rate_plan => (
                  <li class="map-row" key={rate_plan.id}>
                    <span class="submap-text">{rate_plan.name}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" height="14" width="12.25" viewBox="0 0 448 512">
                      <path
                        fill="currentColor"
                        d="M438.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-160-160c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L338.8 224 32 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l306.7 0L233.4 393.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l160-160z"
                      />
                    </svg>
                    {this.renderMappingStatus(rate_plan.id, false, room_type.id)}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </Host>
    );
  }
}
