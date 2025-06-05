import { Component, Event, EventEmitter, Host, Prop, h } from '@stencil/core';

@Component({
  tag: 'ir-switch',
  styleUrl: 'ir-switch.css',
  scoped: true,
})
export class IrSwitch {
  /**
   * Whether the switch is currently checked (on).
   * This is mutable and can be toggled internally.
   */
  @Prop({ mutable: true }) checked = false;

  /**
   * Optional ID for the switch.
   * If not provided, a random ID will be generated.
   */
  @Prop() switchId: string;

  /**
   * Disables the switch if true.
   */
  @Prop() disabled: boolean = false;

  /**
   * Emitted when the checked state changes.
   * Emits `true` when turned on, `false` when turned off.
   *
   * Example:
   * ```tsx
   * <ir-switch onCheckChange={(e) => console.log(e.detail)} />
   * ```
   */
  @Event() checkChange: EventEmitter<boolean>;

  private switchRoot: HTMLButtonElement;
  private _id = '';

  componentWillLoad() {
    this._id = this.generateRandomId(10);
  }

  componentDidLoad() {
    if (!this.switchRoot) {
      return;
    }
    this.switchRoot.setAttribute('aria-checked', this.checked ? 'true' : 'false');
  }
  /**
   * Generates a random alphanumeric ID of specified length.
   *
   * @param length Number of characters in the ID.
   * @returns A string with the generated ID.
   */
  private generateRandomId(length: number) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }
  /**
   * Toggles the `checked` state of the switch and updates accessibility attributes.
   * Also emits the `checkChange` event with the new state.
   *
   * Example:
   * ```ts
   * const el = document.querySelector('ir-switch');
   * el.handleCheckChange(); // toggles on/off
   * ```
   */
  private handleCheckChange() {
    this.checked = !this.checked;
    this.switchRoot.setAttribute('aria-checked', this.checked ? 'true' : 'false');
    this.checkChange.emit(this.checked);
  }

  render() {
    return (
      <Host>
        <button
          disabled={this.disabled}
          ref={el => (this.switchRoot = el)}
          type="button"
          id={this.switchId || this._id}
          onClick={this.handleCheckChange.bind(this)}
          role="switch"
          data-state={this.checked ? 'checked' : 'unchecked'}
          value={'on'}
          class="SwitchRoot"
        >
          <span class="SwitchThumb" data-state={this.checked ? 'checked' : 'unchecked'}></span>
        </button>
        <input type="checkbox" checked={this.checked} aria-hidden="true" tabIndex={-1} value={'on'} class="hidden-input" />
      </Host>
    );
  }
}
