import { Component, Listen, Prop, h, Event, EventEmitter } from '@stencil/core';
import { checkboxes } from '../../common/models';

@Component({
  tag: 'ir-checkboxes',
})
export class IrCheckBoxes {
  @Prop() checkboxes: checkboxes[] = [];
  checkedCheckboxes: checkboxes[] = [];

  @Event({ bubbles: true, composed: true }) checkboxesChange: EventEmitter<checkboxes[]>;

  @Listen('checkboxChange')
  handleCheckboxChange(event) {
    if (event.detail.checked) {
      this.checkedCheckboxes.push(this.checkboxes[parseInt(event.detail.name)]);
    } else {
      this.checkedCheckboxes.splice(this.checkedCheckboxes.indexOf(this.checkboxes[parseInt(event.detail.name)]), 1);
    }
    this.checkboxesChange.emit(this.checkedCheckboxes);
  }

  componentWillLoad() {
    this.checkedCheckboxes = this.checkboxes.filter(checkbox => checkbox.checked);
    if (this.checkedCheckboxes.length > 0) {
      this.checkboxesChange.emit(this.checkedCheckboxes);
    }
  }

  render() {
    return (
      <div>
        {this.checkboxes.map((checkbox, index) => (
          <ir-checkbox name={index.toString()} label={checkbox.text} checked={checkbox.checked || false}></ir-checkbox>
        ))}
      </div>
    );
  }
}
