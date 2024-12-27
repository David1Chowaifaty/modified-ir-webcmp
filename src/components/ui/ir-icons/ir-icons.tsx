import { Component, Prop, h } from '@stencil/core';
import icons, { TIcons } from './icons';

@Component({
  tag: 'ir-icons',
  styleUrl: 'ir-icons.css',
  scoped: true,
})
export class IrIcons {
  @Prop() name: TIcons;
  @Prop() svgClassName: string;
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
