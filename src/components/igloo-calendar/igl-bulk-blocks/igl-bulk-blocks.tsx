import calendar_data from '@/stores/calendar-data';
import { Component, h, State } from '@stencil/core';
export type SelectedRooms = Record<string | number, (string | number)[]>;
@Component({
  tag: 'igl-bulk-blocks',
  styleUrls: ['igl-bulk-blocks.css', '../../../common/sheet.css'],
  scoped: true,
})
export class IglBulkBlocks {
  @State() selectedRoomTypes: SelectedRooms[] = [];
  private total: number;
  private allRoomTypes: SelectedRooms[] = [];

  componentWillLoad() {
    this.total = calendar_data.roomsInfo.length;
    this.selectAllRoomTypes();
  }

  private toggleAllRoomTypes(e: CustomEvent) {
    e.stopImmediatePropagation();
    e.stopPropagation();
    if (!e.detail) {
      this.selectedRoomTypes = [];
      return;
    }
    this.selectedRoomTypes = this.allRoomTypes;
  }
  private selectAllRoomTypes() {
    this.allRoomTypes = calendar_data.roomsInfo.map(rt => ({
      [rt.id]: rt.physicalrooms.map(room => room.id),
    }));
    this.selectedRoomTypes = this.allRoomTypes;
  }
  private toggleRoom({ checked, roomId, roomTypeId }: { checked: boolean; roomTypeId: number; roomId: number }): void {
    // clone current selection
    const selected = [...this.selectedRoomTypes];
    // find existing entry for this roomType
    const idx = selected.findIndex(entry => Object.keys(entry)[0] === roomTypeId.toString());

    if (checked) {
      // add the room
      if (idx > -1) {
        const rooms = selected[idx][roomTypeId];
        if (!rooms.includes(roomId)) {
          selected[idx] = { [roomTypeId]: [...rooms, roomId] };
        }
      } else {
        selected.push({ [roomTypeId]: [roomId] });
      }
    } else {
      // remove the room
      if (idx > -1) {
        const filtered = selected[idx][roomTypeId].filter(id => id !== roomId);
        if (filtered.length) {
          selected[idx] = { [roomTypeId]: filtered };
        } else {
          selected.splice(idx, 1);
        }
      }
    }

    this.selectedRoomTypes = selected;
  }
  private toggleRoomType({ checked, roomTypeId }: { checked: boolean; roomTypeId: number }): void {
    const selected = [...this.selectedRoomTypes];
    const idx = selected.findIndex(entry => Object.keys(entry)[0] === roomTypeId.toString());

    if (checked) {
      const roomType = calendar_data.roomsInfo.find(rt => rt.id === roomTypeId);
      const allRooms = roomType ? roomType.physicalrooms.map(r => r.id) : [];

      if (idx > -1) {
        selected[idx] = { [roomTypeId]: allRooms };
      } else {
        selected.push({ [roomTypeId]: allRooms });
      }
    } else {
      if (idx > -1) {
        selected.splice(idx, 1);
      }
    }

    this.selectedRoomTypes = selected;
  }
  render() {
    const selectedRoomsByType = this.selectedRoomTypes.reduce((acc, entry) => {
      const typeId = Number(Object.keys(entry)[0]);
      acc[typeId] = entry[typeId];
      return acc;
    }, {} as Record<number, (string | number)[]>);

    // are _all_ types “fully” selected? i.e. selectedRooms.length === physicalrooms.length
    const allFullySelected = calendar_data.roomsInfo.every(({ id, physicalrooms }) => {
      const sel = selectedRoomsByType[id] || [];
      return sel.length === physicalrooms.length;
    });

    // only hide the per-room UI when everything is selected
    const shouldShowAllRooms = !allFullySelected;
    return (
      <form class={'bulk-sheet-container'}>
        <div class="sheet-header d-flex align-items-center">
          <ir-title class="px-1" label="Bulk Block Dates" displayContext="sidebar"></ir-title>
        </div>
        <div class="sheet-body px-1">
          <div class="text-muted">{1 === 1 ? <p>Select the listings that you want to block.</p> : <p>Select the roomtypes and units that you want to block.</p>}</div>
          <div class="d-flex flex-column" style={{ gap: '1rem' }}>
            <ir-checkbox
              indeterminate={this.selectedRoomTypes?.length > 0 && this.selectedRoomTypes?.length < this.allRoomTypes?.length}
              checked={this.selectedRoomTypes.length === this.total}
              onCheckChange={e => this.toggleAllRoomTypes(e)}
              label="All property"
              labelClass="m-0 p-0 ml-1"
            ></ir-checkbox>
            {shouldShowAllRooms &&
              calendar_data.roomsInfo.map(roomType => {
                const selectedRoomType = this.selectedRoomTypes.find(rt => !!rt[roomType.id]);
                const selectedRooms = selectedRoomType ? selectedRoomType[roomType.id] : [];
                const physicalRoomsLength = roomType.physicalrooms.length;
                return (
                  <div class="d-flex flex-column" style={{ gap: '0.5rem' }}>
                    <ir-checkbox
                      onCheckChange={e => this.toggleRoomType({ checked: e.detail, roomTypeId: roomType.id })}
                      checked={selectedRooms?.length === physicalRoomsLength}
                      indeterminate={selectedRooms?.length > 0 && selectedRooms?.length < physicalRoomsLength}
                      label={roomType.name}
                      labelClass="m-0 p-0 ml-1"
                    ></ir-checkbox>
                    <div class="d-flex ml-1 flex-column" style={{ gap: '0.5rem' }}>
                      {roomType.physicalrooms.map(room => (
                        <ir-checkbox
                          checked={!!selectedRooms.find(r => r === room.id)}
                          onCheckChange={e => this.toggleRoom({ checked: e.detail, roomTypeId: roomType.id, roomId: room.id })}
                          label={room.name}
                          labelClass="m-0 p-0 ml-1"
                        ></ir-checkbox>
                      ))}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
        <div class={'sheet-footer'}>
          <ir-button text="Cancel" btn_color="secondary" class={'flex-fill'}></ir-button>
          <ir-button text="Save" btn_type="submit" class="flex-fill"></ir-button>
        </div>
      </form>
    );
  }
}
