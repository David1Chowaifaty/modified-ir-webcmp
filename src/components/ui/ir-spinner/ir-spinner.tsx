import { Component, Element, Host, Prop, Watch, h } from '@stencil/core';

@Component({
  tag: 'ir-spinner',
  styleUrl: 'ir-spinner.css',
  shadow: true,
})
export class IrSpinner {
  @Element() el: HTMLIrSpinnerElement;

  @Prop() size: number;
  @Prop() borderWidth: number;
  @Prop() unit: 'px' | 'rem' = 'rem';
  @Prop() color: string;

  componentWillLoad() {
    this.initStyles();
  }
  @Watch('size')
  handleSpinnerSizeChange() {
    this.initStyles();
  }
  @Watch('borderWidth')
  handleSpinnerBorderWidthChange() {
    this.initStyles();
  }
  @Watch('unit')
  handleSpinnerUnitChange() {
    this.initStyles();
  }
  @Watch('color')
  handleSpinnerColorChange() {
    this.initStyles();
  }
  private initStyles() {
    if (this.size) {
      this.applyCssElement(`${this.size}${this.unit}`, '--ir-spinner-size');
    }
    if (this.borderWidth) {
      this.applyCssElement(`${this.borderWidth}${this.unit}`, '--ir-spinner-size');
    }
    if (this.color) {
      this.applyCssElement(`${this.color}`, '--ir-spinner-color');
    }
  }
  private applyCssElement(value: string, key: '--ir-spinner-color' | '--ir-spinner-border-width' | '--ir-spinner-size' | (string & {})) {
    this.el.style.setProperty(key, value);
  }
  render() {
    return <Host></Host>;
  }
}
