import { Component, h, Prop, Event, EventEmitter } from '@stencil/core';
import { v4 as uuidv4 } from 'uuid';
import 'jquery';
import 'bootstrap-switch';
import 'bootstrap-switch/dist/css/bootstrap3/bootstrap-switch.css';
import $ from 'jquery';
import './jquery-extensions';

@Component({
  tag: 'ir-switch',
})
export class MyComponent {
  @Prop({ mutable: true }) value: boolean = false;
  @Prop() labelOn: string;
  @Prop() labelOff: string;
  @Prop() size?: string | 'mini' | 'small' | 'normal' | 'large'; // Add size prop
  @Prop() switch_animate?: boolean; // Add animate prop
  @Prop() disabled?: boolean; // Add disabled prop
  @Prop() readonly?: boolean; // Add readonly prop
  @Prop() indeterminate?: boolean; // Add indeterminate prop
  @Prop() inverse?: boolean; // Add inverse prop
  @Prop() radioAllOff?: boolean; // Add radioAllOff prop
  @Prop() colorOn?: string; // Add onColor prop
  @Prop() offColor?: string; // Add offColor prop
  @Prop() classOn?: string; // Add onClass prop
  @Prop() offClass?: string; // Add offClass prop
  @Prop() labelText?: string; // Add labelText prop
  @Prop() handleWidth?: string | 'auto'; // Add handleWidth prop
  @Prop() labelWidth?: string | 'auto'; // Add labelWidth prop
  @Prop() baseClass?: string; // Add baseClass prop
  @Prop() wrapperClass?: string; // Add wrapperClass prop

  @Event({ bubbles: true, composed: true }) valueChange: EventEmitter<boolean>;

  componentId: string = uuidv4();

  private testElement: JQuery;

  componentDidLoad() {
    this.testElement = $(`#${this.componentId}`);
    this.initializeSwitch();
  }

  initializeSwitch() {
    if (this.testElement && this.testElement.length) {
      // Unbind previous event listeners
      this.testElement.off('switchChange.bootstrapSwitch');

      // Initialize Bootstrap Switch with updated state and props
      this.testElement.bootstrapSwitch({
        state: this.value,
        onText: this.labelOn,
        offText: this.labelOff,
        size: this.size,
        animate: this.switch_animate,
        disabled: this.disabled,
        readonly: this.readonly,
        indeterminate: this.indeterminate,
        inverse: this.inverse,
        radioAllOff: this.radioAllOff,
        onColor: this.colorOn,
        offColor: this.offColor,
        onClass: this.classOn,
        offClass: this.offClass,
        labelText: this.labelText,
        handleWidth: this.handleWidth,
        labelWidth: this.labelWidth,
        baseClass: this.baseClass,
        wrapperClass: this.wrapperClass,
      });

      // Add event listener for switch change
      this.testElement.on('switchChange.bootstrapSwitch', (event, state) => {
        console.log('switchChange.bootstrapSwitch', event);
        this.onSwitchChangeCallback(state);
      });
    }
  }

  onSwitchChangeCallback(state: boolean) {
    this.value = state;
    this.valueChange.emit(this.value);
  }

  render() {
    //console.log('Props', this.value);
    return <input type="checkbox" id={this.componentId} />;
  }
}
