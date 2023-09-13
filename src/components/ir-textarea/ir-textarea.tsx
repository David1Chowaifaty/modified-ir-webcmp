import { Component,Prop, h } from '@stencil/core';

@Component({
  tag: 'ir-textarea'
})
export class IrTextArea {  
  @Prop() rows = 3;
  @Prop() cols = 5;
  @Prop() text = '';
  @Prop() label = '<label>';
  @Prop() placeholder='<placeholder>';
  connectedCallback() {}
  disconnectedCallback() {}
  render() {    
    return (
        <div class="form-group">
          <label>{this.label}</label>
          <textarea rows={this.rows} class="form-control" placeholder={this.placeholder} ></textarea>
        </div>);
  }
}
