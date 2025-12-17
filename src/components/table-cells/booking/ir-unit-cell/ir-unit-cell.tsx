import { IUnit, Room } from '@/models/booking.dto';
import { Component, Host, Prop, h } from '@stencil/core';

@Component({
  tag: 'ir-unit-cell',
  styleUrl: 'ir-unit-cell.css',
  scoped: true,
})
export class IrUnitCell {
  @Prop() room: Room;
  render() {
    return (
      <Host>
        <p>{this.room.roomtype.name}</p>
        {this.room.unit && <ir-unit-tag unit={(this.room.unit as IUnit).name}></ir-unit-tag>}
      </Host>
    );
  }
}
