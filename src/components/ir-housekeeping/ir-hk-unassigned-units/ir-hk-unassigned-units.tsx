import housekeeping_store from '@/stores/housekeeping.store';
import { Component, Host, Prop, h } from '@stencil/core';

@Component({
  tag: 'ir-hk-unassigned-units',
  styleUrl: 'ir-hk-unassigned-units.css',
  scoped: true,
})
export class IrHkUnassignedUnits {
  @Prop() assignUnassignedRooms = true;
  render() {
    return (
      <Host>
        {housekeeping_store.hk_criteria.units_assignments.unassigned_units.map(unit => (
          <p>
            {unit.name}
            <ir-switch></ir-switch>
            <ir-select LabelAvailable={false} data={[{ text: 'hello', value: 'hello' }]}></ir-select>
          </p>
        ))}
      </Host>
    );
  }
}
