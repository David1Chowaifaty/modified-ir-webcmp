import { Component, Event, EventEmitter, Host, Prop, State, Watch, h } from '@stencil/core';
import { v4 } from 'uuid';

@Component({
  tag: 'ir-checkbox',
  styleUrl: 'ir-checkbox.css',
  scoped: true,
})
export class IrCheckbox {
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
  @Prop() checkboxId = v4();

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

  private checkboxRef: HTMLButtonElement;

  componentWillLoad() {
    this.currentChecked = this.checked;
  }
  componentDidLoad() {
    if (this.checkboxRef) {
      this.checkboxRef.setAttribute('aria-checked', JSON.stringify(this.checked));
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
    if (this.checkboxRef) {
      this.checkboxRef.setAttribute('aria-checked', JSON.stringify(this.currentChecked));
    }
    this.checkChange.emit(this.currentChecked);
  }

  render() {
    return (
      <Host>
        <button
          disabled={this.disabled}
          name={this.name}
          onClick={this.handleCheckChange.bind(this)}
          id={this.checkboxId}
          data-state={this.currentChecked || this.indeterminate ? 'checked' : 'unchecked'}
          value={'on'}
          ref={ref => (this.checkboxRef = ref)}
          type="button"
          role="checkbox"
          class="CheckboxRoot"
        >
          {this.currentChecked && (
            <svg xmlns="http://www.w3.org/2000/svg" height="14" width="12.25" viewBox="0 0 448 512">
              <path
                fill="currentColor"
                d="M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7 393.4 105.4c12.5-12.5 32.8-12.5 45.3 0z"
              />
            </svg>
          )}
          {this.indeterminate && (
            <svg xmlns="http://www.w3.org/2000/svg" height="14" width="12.25" viewBox="0 0 448 512">
              <path fill="currentColor" d="M432 256c0 17.7-14.3 32-32 32L48 288c-17.7 0-32-14.3-32-32s14.3-32 32-32l352 0c17.7 0 32 14.3 32 32z" />
            </svg>
          )}
        </button>
        <input type="checkbox" indeterminate={this.indeterminate} aria-hidden="true" tabindex="-1" value="on" checked={this.currentChecked} class="checkbox" />
        {this.label && (
          <label htmlFor={this.checkboxId} class={this.labelClass}>
            {this.label}
          </label>
        )}
      </Host>
    );
  }
}
