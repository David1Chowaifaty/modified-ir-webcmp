import { HouseKeepingService } from '@/services/housekeeping.service';
import { RoomService } from '@/services/room.service';
import { updateHKStore } from '@/stores/housekeeping.store';
import { Component, Host, Prop, State, Watch, h } from '@stencil/core';
import axios from 'axios';

@Component({
  tag: 'ir-housekeeping',
  styleUrl: 'ir-housekeeping.css',
  scoped: true,
})
export class IrHousekeeping {
  @Prop() language: string = '';
  @Prop() ticket: string = '';
  @Prop() baseurl: string = '';
  @Prop() propertyid: number;

  @State() isLoading = false;

  private roomService = new RoomService();
  private houseKeepingService = new HouseKeepingService();

  componentWillLoad() {
    if (this.baseurl) {
      axios.defaults.baseURL = this.baseurl;
    }
    if (this.ticket !== '') {
      this.roomService.setToken(this.ticket);
      this.houseKeepingService.setToken(this.ticket);
      updateHKStore('default_properties', { token: this.ticket, property_id: this.propertyid, language: this.language });
      this.initializeApp();
    }
  }
  @Watch('ticket')
  async ticketChanged(newValue: string, oldValue: string) {
    if (newValue !== oldValue) {
      this.roomService.setToken(this.ticket);
      this.houseKeepingService.setToken(this.ticket);
      updateHKStore('default_properties', { token: this.ticket, property_id: this.propertyid, language: this.language });
      this.initializeApp();
    }
  }

  async initializeApp() {
    try {
      this.isLoading = true;
      await Promise.all([this.houseKeepingService.getExposedHKSetup(this.propertyid), this.roomService.fetchData(this.propertyid, this.language)]);
    } catch (error) {
      console.error(error);
    } finally {
      this.isLoading = false;
    }
  }
  render() {
    if (this.isLoading) {
      return <ir-loading-screen></ir-loading-screen>;
    }
    return (
      <Host>
        <ir-interceptor></ir-interceptor>
        <ir-toast></ir-toast>
        <section class="p-1">
          <ir-unit-status class="mb-1"></ir-unit-status>
          <ir-hk-team class="mb-1"></ir-hk-team>
        </section>
      </Host>
    );
  }
}
