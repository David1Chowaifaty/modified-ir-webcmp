import { Component, Fragment, Host, State, h } from '@stencil/core';
import { IrMappingService } from './ir-mapping.service';
import channels_data, { addMapping, setMappedChannel } from '@/stores/channel.store';
import { RoomDetail, RatePlanDetail } from '@/models/IBooking';
import locales from '@/stores/locales.store';

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

  renderMappingStatus(
    mappedField:
      | {
          hide: boolean;
          result: RoomDetail;
          occupancy?: number;
        }
      | {
          hide: boolean;
          result: RatePlanDetail;
          occupancy?: number;
        },
    id: string,
    isRoomType: boolean,
    roomTypeId?: string,
  ) {
    if (mappedField.hide) {
      return <td></td>;
    }
    if (mappedField.result) {
      return (
        <Fragment>
          <td class="px-2 d-sm-none text-blue d-flex align-items-center">
            <span class="m-0 p-0 d-flex align-items-center selected-map">
              <span class="selected-map-title">{mappedField.result.name}</span>
              <svg xmlns="http://www.w3.org/2000/svg" height="14" width="12.25" viewBox="0 0 448 512">
                <path
                  fill={'var(--blue)'}
                  d="M224 256A128 128 0 1 0 224 0a128 128 0 1 0 0 256zm-45.7 48C79.8 304 0 383.8 0 482.3C0 498.7 13.3 512 29.7 512H418.3c16.4 0 29.7-13.3 29.7-29.7C448 383.8 368.2 304 269.7 304H178.3z"
                />
              </svg>
              {mappedField.occupancy}
            </span>
            <ir-icon class="ml-1 p-0" onIconClickHandler={() => this.mappingService.removedMapping(mappedField.result.id.toString(), isRoomType)}>
              <svg slot="icon" xmlns="http://www.w3.org/2000/svg" height="14" width="12.25" viewBox="0 0 448 512">
                <path
                  fill={'var(--blue)'}
                  d="M135.2 17.7C140.6 6.8 151.7 0 163.8 0H284.2c12.1 0 23.2 6.8 28.6 17.7L320 32h96c17.7 0 32 14.3 32 32s-14.3 32-32 32H32C14.3 96 0 81.7 0 64S14.3 32 32 32h96l7.2-14.3zM32 128H416V448c0 35.3-28.7 64-64 64H96c-35.3 0-64-28.7-64-64V128zm96 64c-8.8 0-16 7.2-16 16V432c0 8.8 7.2 16 16 16s16-7.2 16-16V208c0-8.8-7.2-16-16-16zm96 0c-8.8 0-16 7.2-16 16V432c0 8.8 7.2 16 16 16s16-7.2 16-16V208c0-8.8-7.2-16-16-16zm96 0c-8.8 0-16 7.2-16 16V432c0 8.8 7.2 16 16 16s16-7.2 16-16V208c0-8.8-7.2-16-16-16z"
                />
              </svg>
            </ir-icon>
          </td>
          <td class="px-2 d-none text-blue d-sm-flex align-items-center">
            <span class="m-0 p-0 d-flex align-items-center selected-map">
              {mappedField.result.name}
              <svg xmlns="http://www.w3.org/2000/svg" height="14" width="12.25" viewBox="0 0 448 512">
                <path
                  fill={'var(--blue)'}
                  d="M224 256A128 128 0 1 0 224 0a128 128 0 1 0 0 256zm-45.7 48C79.8 304 0 383.8 0 482.3C0 498.7 13.3 512 29.7 512H418.3c16.4 0 29.7-13.3 29.7-29.7C448 383.8 368.2 304 269.7 304H178.3z"
                />
              </svg>
              {mappedField.occupancy}
            </span>
            <ir-icon class="ml-1 p-0" onIconClickHandler={() => this.mappingService.removedMapping(mappedField.result.id.toString(), isRoomType)}>
              <svg slot="icon" xmlns="http://www.w3.org/2000/svg" height="14" width="12.25" viewBox="0 0 448 512">
                <path
                  fill={'var(--blue)'}
                  d="M135.2 17.7C140.6 6.8 151.7 0 163.8 0H284.2c12.1 0 23.2 6.8 28.6 17.7L320 32h96c17.7 0 32 14.3 32 32s-14.3 32-32 32H32C14.3 96 0 81.7 0 64S14.3 32 32 32h96l7.2-14.3zM32 128H416V448c0 35.3-28.7 64-64 64H96c-35.3 0-64-28.7-64-64V128zm96 64c-8.8 0-16 7.2-16 16V432c0 8.8 7.2 16 16 16s16-7.2 16-16V208c0-8.8-7.2-16-16-16zm96 0c-8.8 0-16 7.2-16 16V432c0 8.8 7.2 16 16 16s16-7.2 16-16V208c0-8.8-7.2-16-16-16zm96 0c-8.8 0-16 7.2-16 16V432c0 8.8 7.2 16 16 16s16-7.2 16-16V208c0-8.8-7.2-16-16-16z"
                />
              </svg>
            </ir-icon>
          </td>
        </Fragment>
      );
    }
    return (
      <td class="px-2">
        {this.activeMapField === id ? (
          <ir-combobox
            autoFocus
            placeholder={locales.entries?.Lcz_ConnectedChannel}
            data={this.availableRooms}
            onComboboxValueChange={e => {
              addMapping(e.detail.data as string, this.activeMapField, isRoomType);
              this.activeMapField = '';
            }}
          ></ir-combobox>
        ) : (
          <span class="cursor-pointer text-danger" onClick={() => this.setActiveField(id, isRoomType, roomTypeId)}>
            {locales.entries.Lcz_NotMapped}
          </span>
        )}
      </td>
    );
  }
  render() {
    return (
      <Host>
        <div class="d-flex w-100 justify-content-end">
          <button
            onClick={() => {
              setMappedChannel();
            }}
            class="btn refresh-btn"
          >
            {locales.entries?.Lcz_Refresh}
          </button>
        </div>
        <table class="m-0 p-0 w-100">
          <thead class={'py-1'}>
            <tr class="py-1">
              <th scope="col" class="py-1 pr-3">
                {channels_data.selectedChannel?.name}
              </th>
              <td>
                <svg xmlns="http://www.w3.org/2000/svg" height="14" width="12.25" viewBox="0 0 448 512">
                  <path d="M438.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-160-160c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L338.8 224 32 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l306.7 0L233.4 393.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l160-160z" />
                </svg>
              </td>
              <th scope="col" class="px-2">
                Igloorooms
              </th>
            </tr>
          </thead>
          <tbody>
            {channels_data.selectedChannel?.property?.room_types?.map(room_type => {
              const mappedRoomType = this.mappingService.checkMappingExists(room_type.id, true);
              return (
                <Fragment>
                  <tr key={room_type.id} class="mb-1">
                    <td>{room_type.name}</td>
                    <td>
                      <svg xmlns="http://www.w3.org/2000/svg" height="14" width="12.25" viewBox="0 0 448 512">
                        <path d="M438.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-160-160c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L338.8 224 32 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l306.7 0L233.4 393.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l160-160z" />
                      </svg>
                    </td>
                    {this.renderMappingStatus(mappedRoomType, room_type.id, true)}
                  </tr>

                  {room_type.rate_plans.map(rate_plan => {
                    const mappedRatePlan = this.mappingService.checkMappingExists(rate_plan.id, false, room_type.id);
                    return (
                      <tr key={rate_plan.id} class="">
                        <td class="submap-text mb-1">{rate_plan.name}</td>
                        <td>
                          {!mappedRatePlan.hide && (
                            <svg xmlns="http://www.w3.org/2000/svg" height="14" width="12.25" viewBox="0 0 448 512">
                              <path
                                fill="currentColor"
                                d="M438.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-160-160c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L338.8 224 32 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l306.7 0L233.4 393.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l160-160z"
                              />
                            </svg>
                          )}
                        </td>
                        {this.renderMappingStatus(mappedRatePlan, rate_plan.id, false, room_type.id)}
                      </tr>
                    );
                  })}
                  <tr>
                    <td class="py-1"></td>
                    <td></td>
                    <td></td>
                  </tr>
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </Host>
    );
  }
}
