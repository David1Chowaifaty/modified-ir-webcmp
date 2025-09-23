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
    const parentChannelId = roomTypeId?.toString();
    const availableRooms = this.mappingService.getAppropriateRooms(isRoomType, parentChannelId);
    if (availableRooms) {
      this.availableRooms = availableRooms;
    }
    this.activeMapField = id.toString();
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
      return <div></div>;
    }
    if (mappedField.result) {
      return (
        <Fragment>
          <div class="pl-2 flex-fill d-sm-none mapped_item text-blue d-flex align-items-center">
            <span class="m-0 p-0 d-flex align-items-center selected-map">
              <span class="selected-map-title">{isRoomType ? mappedField.result.name : mappedField.result['short_name']}</span>
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
          </div>
          <div class="pl-2 flex-fill d-none mapped_item text-blue d-sm-flex align-items-center">
            <span class="mapped_name">{isRoomType ? mappedField.result.name : mappedField.result['short_name']}</span>
            <div class="d-flex align-items-center gap-3 flex-fill">
              <svg xmlns="http://www.w3.org/2000/svg" height="14" width="12.25" viewBox="0 0 448 512">
                <path
                  fill={'var(--blue)'}
                  d="M224 256A128 128 0 1 0 224 0a128 128 0 1 0 0 256zm-45.7 48C79.8 304 0 383.8 0 482.3C0 498.7 13.3 512 29.7 512H418.3c16.4 0 29.7-13.3 29.7-29.7C448 383.8 368.2 304 269.7 304H178.3z"
                />
              </svg>
              <span>{mappedField.occupancy}</span>
            </div>
            <ir-button
              variant="icon"
              onClickHandler={() => this.mappingService.removedMapping(mappedField.result.id.toString(), isRoomType)}
              icon_name="trash"
              style={{ '--icon-size': '1rem', '--icon-button-color': '#1e9ff2', '--icon-button-hover-color': '#104064 ' }}
            ></ir-button>
          </div>
        </Fragment>
      );
    }
    return (
      <div class="pl-2  flex-fill mapped_item">
        {this.activeMapField === id ? (
          <ir-combobox
            autoFocus
            placeholder={locales.entries?.Lcz_NotMapped}
            data={this.availableRooms}
            onComboboxValueChange={e => {
              addMapping(e.detail.data as string, this.activeMapField, isRoomType);
              this.activeMapField = '';
            }}
          ></ir-combobox>
        ) : (
          <span class="cursor-pointer  not_mapped_btn" onClick={() => this.setActiveField(id, isRoomType, roomTypeId)}>
            {locales.entries.Lcz_NotMapped}
          </span>
        )}
      </div>
    );
  }

  render() {
    return (
      <Host class="py-md-2 px-md-2">
        <div class="d-flex p-0 m-0 w-100 justify-content-end">
          <button
            onClick={() => {
              setMappedChannel();
            }}
            class="btn refresh-btn"
          >
            {locales.entries?.Lcz_Refresh}
          </button>
        </div>
        <section class="w-100">
          <div class="pt-1 mapped_row">
            <p class="mapped_item channel_name">{channels_data.selectedChannel?.name}</p>
            <svg xmlns="http://www.w3.org/2000/svg" height="14" width="12.25" viewBox="0 0 448 512">
              <path d="M438.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-160-160c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L338.8 224 32 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l306.7 0L233.4 393.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l160-160z" />
            </svg>
            <p class="pl-2 mapped_item channel_name">igloorooms</p>
          </div>
          <div>
            {channels_data.selectedChannel?.property?.room_types?.map(room_type => {
              const mappedRoomType = this.mappingService.checkMappingExists(room_type.id.toString(), true);
              return (
                <Fragment>
                  <div key={room_type.id} class="mapped_row room_type pt-1">
                    <p class="mapped_item">{room_type.name}</p>

                    <svg xmlns="http://www.w3.org/2000/svg" height="14" width="12.25" viewBox="0 0 448 512">
                      <path d="M438.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-160-160c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L338.8 224 32 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l306.7 0L233.4 393.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l160-160z" />
                    </svg>

                    {this.renderMappingStatus(mappedRoomType, room_type.id, true)}
                  </div>

                  {room_type.rate_plans.map(rate_plan => {
                    const mappedRatePlan = this.mappingService.checkMappingExists(rate_plan.id.toString(), false, room_type.id.toString());
                    // console.log(mappedRatePlan);
                    return (
                      <div key={rate_plan.id} class=" mapped_row rate_plan">
                        <p class="pl-1 submap-text mapped_item">{rate_plan.name}</p>

                        {!mappedRatePlan.hide && (
                          <svg xmlns="http://www.w3.org/2000/svg" height="14" width="12.25" viewBox="0 0 448 512">
                            <path
                              fill="currentColor"
                              d="M438.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-160-160c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L338.8 224 32 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l306.7 0L233.4 393.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l160-160z"
                            />
                          </svg>
                        )}

                        {this.renderMappingStatus(mappedRatePlan, rate_plan.id, false, room_type.id)}
                      </div>
                    );
                  })}
                  {/* <tdivr>
                    <td class="py-1"></td>
                    <td></td>
                    <td></td>
                  </tdivr> */}
                </Fragment>
              );
            })}
          </div>
        </section>
      </Host>
    );
  }
}
