import { Component, Host, Prop, Watch, h } from '@stencil/core';
import axios from 'axios';

@Component({
  tag: 'ir-payment-option',
  styleUrl: 'ir-payment-option.css',
  scoped: true,
})
export class IrPaymentOption {
  @Prop() baseurl: string;
  @Prop() propertyid: string;
  @Prop() ticket: string;

  componentWillLoad() {
    axios.defaults.baseURL = this.baseurl;
    if (this.ticket) {
      this.init();
    }
  }
  @Watch('token')
  handleTokenChange(newValue: string, oldValue: string) {
    if (newValue !== oldValue) {
      this.init();
    }
  }
  init() {
    this.initServices();
    this.fetchData();
  }
  fetchData() {}
  initServices() {}
  render() {
    return <Host></Host>;
  }
}
