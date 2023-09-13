import { Component, h, Prop } from '@stencil/core';

@Component({
  tag: 'ir-loader',
  styleUrl: 'ir-loader.css',
})
export class IrLoader {
  @Prop() size: string = 'md';

  render() {
    return (
      <div class={`lds-default ${this.size}`}>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
    );
  }
}
