import { Component,Prop, h } from '@stencil/core';

@Component({
  tag: 'ir-span'
})
export class IrSpan {  
  @Prop() text;
  connectedCallback() {}
  disconnectedCallback() {}
  render() {    
    return (<span>{this.text}</span>);
  }
}
