import { Component, Element, Host, Prop, Watch, h } from '@stencil/core';

@Component({
  tag: 'ir-spinner',
  styleUrl: 'ir-spinner.css',
  shadow: true,
})
export class IrSpinner {
  @Element() el: HTMLIrSpinnerElement;
  /**
   * Size of the spinner (diameter).
   * Example: `size={2}` with `unit="rem"` sets spinner to `2rem`.
   */
  @Prop() size: number;

  /**
   * Thickness of the spinner's border.
   * Example: `borderWidth={4}` renders a `4px` or `4rem` thick border.
   */
  @Prop() borderWidth: number;

  /**
   * CSS unit used for `size` and `borderWidth`.
   * Can be `'px'` or `'rem'`.
   */
  @Prop() unit: 'px' | 'rem' = 'rem';

  /**
   * Color of the spinner.
   * Accepts any valid CSS color string.
   */
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
  /**
   * Applies CSS custom properties based on current prop values.
   */
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
  /**
   * Helper function to set CSS custom properties on the host element.
   *
   * @param value - The CSS value to apply
   * @param key - The CSS custom property name (e.g., `--ir-spinner-size`)
   */
  private applyCssElement(value: string, key: '--ir-spinner-color' | '--ir-spinner-border-width' | '--ir-spinner-size' | (string & {})) {
    this.el.style.setProperty(key, value);
  }
  render() {
    return <Host></Host>;
  }
}
