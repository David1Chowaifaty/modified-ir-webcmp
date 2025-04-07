import Token from '@/models/Token';
import { Component, Host, Prop, State, Watch, h } from '@stencil/core';

@Component({
  tag: 'ir-sales-by-country',
  styleUrl: 'ir-sales-by-country.css',
  scoped: true,
})
export class IrSalesByCountry {
  @Prop() language: string = '';
  @Prop() ticket: string = '';
  @Prop() propertyid: number;
  @Prop() p: string;

  @State() isLoading = false;
  private token = new Token();
  @Watch('ticket')
  ticketChanged(newValue: string, oldValue: string) {
    if (newValue === oldValue) {
      return;
    }
    this.token.setToken(this.ticket);
    this.initializeApp();
  }
  private initializeApp() {}
  render() {
    if (this.isLoading) {
      return <ir-loading-screen></ir-loading-screen>;
    }
    return (
      <Host>
        <slot></slot>
      </Host>
    );
  }
}
