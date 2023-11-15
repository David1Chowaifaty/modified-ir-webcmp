import { Component, Host, Prop, h } from '@stencil/core';

@Component({
  tag: 'ir-loading-screen',
  styleUrl: 'ir-loading-screen.css',
  scoped: true,
})
export class IrLoadingScreen {
  @Prop() message: string = '';
  render() {
    return (
      <Host>
        <div class="loaderContainer">
          <span class="loader"></span>
          {this.message && <p class={'m-0'}>{this.message}</p>}
        </div>
      </Host>
    );
  }
}
