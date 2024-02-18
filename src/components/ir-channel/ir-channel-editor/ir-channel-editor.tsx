import { onChannelChange } from '@/stores/channel.store';
import locales from '@/stores/locales.store';
import { Component, Event, EventEmitter, Host, Listen, State, h } from '@stencil/core';

@Component({
  tag: 'ir-channel-editor',
  styleUrl: 'ir-channel-editor.css',
  scoped: true,
})
export class IrChannelEditor {
  @State() selectedTab: string = '';
  @State() headerTitles = [
    {
      id: 'general_settings',
      name: 'General Settings',
      disabled: false,
    },
    { id: 'mapping', name: 'Mapping', disabled: true },
    { id: 'channel_booking', name: 'Channel Booking', disabled: true },
  ];
  @State() selectedRoomType = [];

  @Event() closeSideBar: EventEmitter<null>;

  componentWillLoad() {
    this.selectedTab = this.headerTitles[0].id;
    onChannelChange('selectedChannel', newValue => {
      if (!!newValue) {
        this.enableAllHeaders();
      }
    });
  }

  @Listen('tabChanged')
  handleTabChange(e: CustomEvent) {
    e.stopPropagation();
    e.stopImmediatePropagation();
    this.selectedTab = e.detail;
  }

  renderTabScreen() {
    switch (this.selectedTab) {
      case 'general_settings':
        return <ir-channel-general></ir-channel-general>;
      case 'mapping':
        return <ir-channel-mapping></ir-channel-mapping>;
      case 'channel_booking':
        return <div>channel booking</div>;
      default:
        return null;
    }
  }

  enableAllHeaders() {
    this.headerTitles = this.headerTitles.map((title, index) => (index < this.headerTitles.length - 1 ? { ...title, disabled: false } : title));
  }
  disableNonFirstTabs() {
    this.headerTitles = this.headerTitles.map((title, index) => (index > 0 ? { ...title, disabled: true } : title));
  }

  render() {
    return (
      <Host class="px-1 d-flex flex-column h-100">
        <nav class="position-sticky sticky-top py-1 top-0 bg-white">
          <div class="d-flex align-items-center  justify-content-between">
            <h3 class="text-left font-medium-2  py-0 my-0">Create Channel</h3>
            <ir-icon
              class={'m-0 p-0 close'}
              onIconClickHandler={() => {
                this.closeSideBar.emit(null);
              }}
            >
              <svg slot="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" height={20} width={20}>
                <path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z" />
              </svg>
            </ir-icon>
          </div>
          <ir-channel-header class="mt-1 px-0" headerTitles={this.headerTitles}></ir-channel-header>
        </nav>
        <section class="pb-1 flex-fill">{this.renderTabScreen()}</section>

        <ir-button class="py-1 top-border " btn_styles="w-100  justify-content-center" text={locales.entries.Lcz_Save}></ir-button>
      </Host>
    );
  }
}
