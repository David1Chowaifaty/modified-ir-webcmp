import { Component, Event, EventEmitter, Host, Prop, h } from '@stencil/core';

@Component({
  tag: 'ir-switch',
  styleUrl: 'ir-switch.css',
  scoped: true,
})
export class IrSwitch {
  @Prop({ mutable: true }) checked = false;
  @Prop() switchId: string;
  @Prop() disabled: boolean = false;

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

  generateRandomId(length: number) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }

  handleCheckChange() {
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
