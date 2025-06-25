import { Component, Event, EventEmitter, Prop, State, h, Watch, Element } from '@stencil/core';
import { v4 } from 'uuid';

@Component({
  tag: 'ir-radio',
  styleUrl: 'ir-radio.css',
  scoped: true,
})
export class IrRadio {
  @Element() el: HTMLIrRadioElement;
  /**
   * Whether the checkbox is checked.
   */
  @Prop() checked: boolean = false;

  /**
   * The label text associated with the checkbox.
   */
  @Prop() label: string;

  /**
   * The unique ID of the checkbox element.
   */
  @Prop() radioBoxId = v4();

  /**
   * The name attribute of the checkbox, used for form submission.
   */
  @Prop() name: string;

  /**
   * Whether the checkbox is in an indeterminate state.
   */
  @Prop() indeterminate: boolean;

  /**
   * Disables the checkbox when true.
   */
  @Prop() disabled: boolean;

  /**
   * CSS class applied to the label element.
   */
  @Prop() labelClass: string;

  /**
   * Internal state tracking whether the checkbox is currently checked.
   */
  @State() currentChecked = false;

  /**
   * Emitted when the checkbox's checked state changes.
   */
  @Event() checkChange: EventEmitter<boolean>;

  private radioRef: HTMLInputElement;

  componentWillLoad() {
    this.currentChecked = this.checked;
  }
  componentDidLoad() {
    if (this.radioRef) {
      this.radioRef.setAttribute('aria-checked', JSON.stringify(this.checked));
    }
  }
  /**
   * Watcher for the `checked` property. Syncs internal state with external prop changes.
   */
  @Watch('checked')
  handleCheckedChange(newValue: boolean) {
    if (newValue === this.currentChecked) {
      return;
    }
    this.currentChecked = this.checked;
  }

  /**
   * Handles user interaction with the checkbox and updates its state.
   */
  private handleCheckChange() {
    this.currentChecked = !this.currentChecked;
    if (this.radioRef) {
      this.radioRef.setAttribute('aria-checked', JSON.stringify(this.currentChecked));
    }
    this.checkChange.emit(this.currentChecked);
  }
  render() {
    return (
      <div class="input-group">
        <label class="check-container radio-container">
          <span>{this.label}</span>
          <input
            type="radio"
            value="000"
            name={this.el?.name}
            title=""
            onChange={() => {
              this.handleCheckChange();
            }}
            checked={this.currentChecked}
            ref={el => (this.radioRef = el)}
          />
          <span class="checkmark my-checkmark"></span>
        </label>
      </div>
    );
  }
}
