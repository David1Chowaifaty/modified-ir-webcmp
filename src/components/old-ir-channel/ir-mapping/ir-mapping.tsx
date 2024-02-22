import { Component, h, Event, EventEmitter, Method, Prop } from '@stencil/core';
//import { Map, MappingModal, RoomType, RatePlan } from '../../../sample/channel/data';
//import { Map, RoomType, RatePlan } from '../../../sample/channel/data';
import { RoomType, RatePlan } from '../../../sample/channel/data';

@Component({
  tag: 'ir-mapping',
})
export class IrMapping {
  @Prop() mapReference: RoomType[];//Map;
  @Prop() hostRoom: RoomType[] = [];//MappingModal;

  @Event() sendMappingToParent: EventEmitter;
  @Prop() map: RoomType[] = null;

  @Method()
  async _onSaveMapping() {
    this.sendMappingToParent.emit(this.hostRoom);
  }

  componentWillLoad() {
    if (this.map !== null) {
      this.hostRoom = this.map;
      this.hostRoom.forEach(room => {
        if (room.value) {
          this.mapReference = this.mapReference.filter(map => map.id !== room.value.id);
          room.value.ratePlans.forEach(ratePlan => {
            if (ratePlan.value) this.mapReference = this.mapReference.filter(map => map.id !== ratePlan.id);
          });
        }
      });
    }
  }

  _onSelectMap(room: RoomType, value: RoomType, index: number) {
    room = {
      ...room,
      value: value,
      mapped: 'mapped',
      mappedName: value.name,
      mappedId: value.id,
    };
    this.hostRoom = [...this.hostRoom.slice(0, index), room, ...this.hostRoom.slice(index + 1)];
    this.mapReference = this.mapReference.filter(map => map.id !== value.id);
  }

  _onSelectRatePlan(ratePlan: RatePlan, _index: number, value: RatePlan, room: RoomType, index: number) {
    ratePlan = {
      ...ratePlan,
      value: value,
      mapped: 'mapped',
      mappedName: value.name,
      mappedId: value.id,
    };
    this.hostRoom = [
      ...this.hostRoom.slice(0, index),
      {
        ...room,
        ratePlans: [...room.ratePlans.slice(0, _index), ratePlan, ...room.ratePlans.slice(_index + 1)],
      },
      ...this.hostRoom.slice(index + 1),
    ];

    let __index = room.value.ratePlans.findIndex(rate => rate.id === value.id);
    room.value.ratePlans.splice(__index, 1);
  }

  _deselectRoom(room: RoomType, index: number) {
    this.mapReference = [...this.mapReference, room.value];
    this.mapReference = this.mapReference.sort((a, b) => (a.id > b.id ? 1 : -1));

    this.hostRoom = [
      ...this.hostRoom.slice(0, index),
      {
        ...room,
        value: null,
        mapped: 'notMapped',
        mappedName: '',
        mappedId: '',
        ratePlans: room.ratePlans.map(ratePlan => ({
          ...ratePlan,
          mapped: 'notMapped',
          mappedName: '',
          mappedId: '',
        })),
      },
      ...this.hostRoom.slice(index + 1),
    ];
  }

  _deselectRatePlan(ratePlan: RatePlan, _index: number, room: RoomType, index: number) {
    console.log(ratePlan);
    room.value.ratePlans = [...room.value.ratePlans, ratePlan.value];
    room.value.ratePlans = room.value.ratePlans.sort((a, b) => (a.id > b.id ? 1 : -1));
    ratePlan = {
      ...ratePlan,
      value: null,
      mapped: 'notMapped',
      mappedName: '',
      mappedId: '',
    };
    this.hostRoom = [
      ...this.hostRoom.slice(0, index),
      {
        ...room,
        ratePlans: [...room.ratePlans.slice(0, _index), ratePlan, ...room.ratePlans.slice(_index + 1)],
      },
      ...this.hostRoom.slice(index + 1),
    ];
  }

  render() {
    return [
      <div class="Mapping font-size-small">
        <div class="d-flex justify-content-end align-items-center">
          <a class="text-primary">Refresh</a>
        </div>
        <div class="container-fluid">
          <div class="row">
            <div class="col-12 mb-1">
              <div class="row ">
                <div class="col-6 d-flex justify-content-between align-items-center font-weight-bold">
                  Iglooroom<ir-icon icon="la la-long-arrow-right"></ir-icon>
                </div>
                <div class="col-6 font-weight-bold">Channel Manager</div>
              </div>
            </div>
            {this.hostRoom.map((room: RoomType, index) => {
              return (
                <div class="col-12 mb-1">
                  <div class="row mb-1">
                    <div class="col-6 d-flex justify-content-between align-items-center">
                      {room.name}
                      <ir-icon icon="la la-long-arrow-right"></ir-icon>
                    </div>
                    <div class={`col-6 `}>
                      {room.mapped === 'notMapped' ? (
                        <div
                          class="text-danger"
                          onClick={() => {
                            this.hostRoom = [
                              ...this.hostRoom.slice(0, index),
                              {
                                ...room,
                                value: '',
                                mapped: 'mapping',
                                mappedName: '',
                                mappedId: '',
                              },
                              ...this.hostRoom.slice(index + 1),
                            ];
                          }}
                        >
                          Not mapped
                        </div>
                      ) : room.mapped === 'mapping' ? (
                        <select
                          id={`${index}`}
                          class="form-control form-control-sm"
                          onChange={(event: any) => {
                            let value = JSON.parse(event.target.value);
                            this._onSelectMap(room, value, index);
                          }}
                        >
                          <option value="">Select Room</option>
                          {this.mapReference.length > 0 &&
                            this.mapReference.map(ref => {
                              return <option value={JSON.stringify(ref)}>{ref.name}</option>;
                            })}
                        </select>
                      ) : (
                        <div class="d-flex flex-grow-1 justify-content-between">
                          <div class="text-primary">
                            {room.mappedName}
                            <ir-icon icon="ft-user"></ir-icon> {room.roomCapacity}
                          </div>
                          <ir-icon
                            icon="text-primary ft-trash"
                            onClick={() => {
                              this._deselectRoom(room, index);
                            }}
                          ></ir-icon>
                        </div>
                      )}
                    </div>
                  </div>
                  <div class="col-12 mb-1">
                    {room.ratePlans &&
                      room.ratePlans.length &&
                      room.ratePlans.map((ratePlan: RatePlan, _index) => (
                        <div class="row mb-1">
                          <div class="col-6 d-flex justify-content-between align-items-center">
                            <div>
                              {ratePlan.name}
                              <ir-icon icon="ft-user"></ir-icon> {room.roomCapacity}
                            </div>
                            {room.mapped === 'mapped' && <ir-icon icon="la la-long-arrow-right"></ir-icon>}
                          </div>
                          <div class="col-6 pr-0">
                            {room.mapped === 'mapped' &&
                              (ratePlan.mapped === 'notMapped' ? (
                                <div
                                  class="text-danger"
                                  onClick={() => {
                                    ratePlan = {
                                      ...ratePlan,
                                      value: '',
                                      mapped: 'mapping',
                                      mappedId: '',
                                      mappedName: '',
                                    };
                                    this.hostRoom = [
                                      ...this.hostRoom.slice(0, index),
                                      {
                                        ...room,
                                        ratePlans: [...room.ratePlans.slice(0, _index), ratePlan, ...room.ratePlans.slice(_index + 1)],
                                      },
                                      ...this.hostRoom.slice(index + 1),
                                    ];
                                  }}
                                >
                                  Not mapped
                                </div>
                              ) : ratePlan.mapped === 'mapping' ? (
                                <select
                                  class="form-control form-control-sm"
                                  onChange={(event: any) => {
                                    // mapped.selectedPlan = event.target.value;
                                    let value = JSON.parse(event.target.value);
                                    this._onSelectRatePlan(ratePlan, _index, value, room, index);
                                  }}
                                >
                                  <option value="">Select Plan</option>
                                  {room.value.ratePlans.length > 0 ? room.value.ratePlans.map(ratePlan => <option value={JSON.stringify(ratePlan)}>{ratePlan.name}</option>) : null}
                                </select>
                              ) : (
                                <div class="d-flex flex-grow-1 justify-content-between">
                                  <div class="text-primary">
                                    {ratePlan.mappedName}
                                    <ir-icon icon="ft-user"></ir-icon> {room.roomCapacity}
                                  </div>
                                  <ir-icon
                                    icon="text-primary ft-trash"
                                    onClick={() => {
                                      this._deselectRatePlan(ratePlan, _index, room, index);
                                    }}
                                  />
                                </div>
                              ))}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>,
    ];
  }
}
