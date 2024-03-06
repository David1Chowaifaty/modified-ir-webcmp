import { IHouseKeepers, IPropertyHousekeepingAssignment } from '@/models/housekeeping';
import calendar_data from '@/stores/calendar-data';
import housekeeping_store from '@/stores/housekeeping.store';
import { Component, Event, EventEmitter, Host, Prop, State, h } from '@stencil/core';

@Component({
  tag: 'ir-hk-unassigned-units',
  styleUrl: 'ir-hk-unassigned-units.css',
  scoped: true,
})
export class IrHkUnassignedUnits {
  @Prop() user: IHouseKeepers | null = null;

  @State() assignedUnits: Map<number, IPropertyHousekeepingAssignment> = new Map();

  @Event() closeSideBar: EventEmitter<null>;

  handleSwitchChange(checked: boolean, unit_id: number, hk_id: number | null, remove: boolean) {
    if (checked) {
      this.assignUnit(unit_id, hk_id);
    }
  }
  assignUnit(unit_id: number, hk_id: number | null) {
    if (this.assignedUnits.has(unit_id) && !hk_id) {
      this.assignedUnits.delete(unit_id);
      return;
    }
    this.assignedUnits.set(unit_id, {
      property_id: housekeeping_store.default_properties.property_id,
      hkm_id: hk_id,
      is_to_assign: true,
      unit_id,
    });
    console.log(this.assignedUnits);
  }

  assignUnits() {
    console.log([...this.assignedUnits.values()]);
  }
  renderRooms() {
    if (!this.user) {
      return housekeeping_store.hk_criteria.units_assignments.unassigned_units.map(unit => (
        <li key={unit.id}>
          <p class="mr-2">{unit.name}</p>
          <ir-select
            class="ml-4"
            // selectedValue={}
            onSelectChange={e => {
              let hk_id = e.detail;
              if (hk_id === '') {
                hk_id = null;
              } else {
                hk_id = +hk_id;
              }
              this.assignUnit(unit.id, hk_id);
            }}
            LabelAvailable={false}
            data={housekeeping_store.hk_criteria.housekeepers.map(hk => ({ text: hk.name, value: hk.id.toString() }))}
          ></ir-select>
        </li>
      ));
    }
    return calendar_data.roomsInfo.map(roomType => {
      if (!roomType.is_active) {
        return null;
      }
      return roomType.physicalrooms.map(physical_room => {
        const taken = !housekeeping_store.hk_criteria.units_assignments.unassigned_units.find(unit => unit.id === physical_room.id);
        let housekeeper = [];
        if (taken) {
          housekeeper = housekeeping_store.hk_criteria.housekeepers.filter(hk => hk.assigned_units.find(unit => unit.id === physical_room.id));
        }
        return (
          <li key={physical_room.id}>
            <div class="d-flex mr-3">
              <p class="mr-2">{physical_room.name}</p> <span>{taken ? housekeeper[0].name : ''}</span>
            </div>
            <ir-switch checked={taken}></ir-switch>
          </li>
        );
      });
    });
  }
  render() {
    return (
      <Host class="px-1">
        <div class="d-flex align-items-center py-1 justify-content-between">
          <h3 class="text-left font-medium-2  py-0 my-0">{!this.user ? 'Assingn Units' : `Assignment for ${this.user.name}`}</h3>
          <ir-icon
            class={'m-0 p-0 close'}
            onIconClickHandler={() => {
              this.closeSideBar.emit(null);
            }}
          >
            <svg slot="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" height={20} width={20}>
              <path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z" />
            </svg>
          </ir-icon>
        </div>
        <section class="pt-1 pb-1 border-top">
          <ul>{this.renderRooms()}</ul>
          <div class="d-flex flex-column flex-md-row align-items-md-center mt-2 w-100">
            <ir-button
              onClickHanlder={() => this.closeSideBar.emit(null)}
              class="flex-fill"
              btn_styles="w-100  justify-content-center align-items-center"
              btn_color="secondary"
              text={'Cancel'}
            ></ir-button>
            <ir-button
              // isLoading={this.isLoading}
              onClickHanlder={this.assignUnits.bind(this)}
              class="flex-fill ml-md-1"
              btn_styles="w-100  justify-content-center align-items-center mt-1 mt-md-0"
              text={'Confirm'}
            ></ir-button>
          </div>
        </section>
      </Host>
    );
  }
}
