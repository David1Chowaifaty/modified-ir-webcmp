import { Component,Prop, h } from '@stencil/core';

@Component({
  tag: 'ir-icon'
})
export class IrIcon {  
  @Prop() icon = 'ft-check';
  connectedCallback() {}
  disconnectedCallback() {}
  render() {    
    return (<i class={this.icon}></i>);
  }
}
