import { Component, Prop, h } from '@stencil/core';
import icons, { TIcons } from './icons';

@Component({
  tag: 'ir-icons',
  styleUrl: 'ir-icons.css',
  scoped: true,
})
export class IrIcons {
  /**
   * The name of the icon to render.
   * Must match a key from the imported `icons` map.
   *
   * Example:
   * ```tsx
   * <ir-icons name="check" />
   * ```
   */
  @Prop() name: TIcons;

  /**
   * Additional CSS class applied to the `<svg>` element.
   * Can be used for sizing, positioning, etc.
   */
  @Prop() svgClassName: string;

  /**
   * Sets the `color` attribute on the `<svg>` element.
   * Accepts any valid CSS color string.
   */
  @Prop() color: string;

  render() {
    const svgPath = icons[this.name] || null;
    if (!svgPath) {
      return null;
    }
    return (
      <svg xmlns="http://www.w3.org/2000/svg" color={this.color} viewBox={svgPath.viewBox} class={`icon ${this.svgClassName}`}>
        <path fill="currentColor" d={svgPath.d}></path>
      </svg>
    );
  }
}
