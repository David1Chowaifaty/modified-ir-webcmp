import { Component, h, Prop, State, Event, EventEmitter, Watch } from '@stencil/core';
import { ChannelManager } from '../../../sample/channel/data';
import { selectOption } from '../../../common/models';
@Component({
  tag: 'ir-general-settings',
})
export class IrGeneralSettings {
  @State() testLoader: boolean = false;
  @Prop() mode: string;
  @Prop() allowed_channels   : selectOption[] = [];
  @Prop() allowed_properties : selectOption[] = [];
  @Prop() allowed_MinStayTypes : selectOption[] = [];
  @Prop({ reflect: true, mutable: true }) connectionStatus: string = 'Not connected';
  @Prop({ reflect: true, mutable: true }) data: ChannelManager = {
    id: '123456',
    channel: 'Channel Name',
    status: 'Active',
    //group: 'Group',
    title: 'Title',
    property: 'Property',
    minimumStay: 'Arrival',
    hotelId: 'hotelId',
    RoomsMapping: null,
  };
  @State() selectedChannel: string = '';
  @State() connected: boolean = false;
  @Event({ bubbles: true, composed: true }) sendToParent: EventEmitter;
  @Event({ bubbles: true, composed: true }) connectionOff: EventEmitter;

  @Watch('data')
  watchHandler(newValue: any) {
    this.selectedChannel = newValue.channel;
  }

  @Watch('mode')
  modewatchHandler(newValue: any) {
    if (newValue === 'edit') {
      this.connected = true;
      this.connectionStatus = 'Connected';
      this.sendToParent.emit(this.data);
    }
  }

  componentDidLoad() {
    const channelSelect = document.querySelector('ir-select.channel-select');
    channelSelect.addEventListener('selectChange', (event: CustomEvent) => {
      this.connected = false;
      this.selectedChannel = event.detail;
      this.data = {...this.data,channel: event.detail};
      this.sendToParent.emit(this.data);
    });

    const titleInput = document.querySelector('ir-input-text#title-input');
    titleInput.addEventListener('textChange', (event: CustomEvent) => {
      this.connected = false;
      this.connectionOff.emit();
      this.data = { ...this.data, title: event.detail };
      this.sendToParent.emit(this.data);
    });

    const propertySelect = document.querySelector('ir-select#property-select');
    propertySelect.addEventListener('selectChange', (event: CustomEvent) => {
      this.connected = false;
      this.connectionOff.emit();
      this.data = { ...this.data, property: event.detail };
      this.sendToParent.emit(this.data);
    });

  }

  componentDidUpdate() {
    // const hotelID = document.querySelector('ir-input-text#hotel-id');
    // hotelID.addEventListener('textChange', (event: CustomEvent) => {
    //   this.connected = false;
    //   this.connectionOff.emit();
    //   this.connectionStatus = 'Not connected';
    //   this.data = {
    //     ...this.data,
    //     hotelId: event.detail.trim(),
    //   };
    // });

    // const minimumStay = document.querySelector('ir-select#minimum-stay-select');
    // minimumStay.addEventListener('selectChange', (event: CustomEvent) => {
    //   this.connected = false;
    //   this.connectionOff.emit();
    //   this.data = {
    //     ...this.data,
    //     minimumStay: event.detail.trim(),
    //   };
    // });

    const channelSelect = document.querySelector('ir-select.channel-select');
    channelSelect.addEventListener('selectChange', (event: CustomEvent) => {
      this.connected = false;
      this.connectionOff.emit();
      this.selectedChannel = event.detail;
      this.data = {
        ...this.data,
        channel: event.detail,
      };
      this.sendToParent.emit(this.data);
    });

    // const groupSelect = document.querySelector('ir-select#group-select');
    // groupSelect.addEventListener('selectChange', (event: CustomEvent) => {
    //   this.connected = false;
    //   this.connectionOff.emit();
    //   this.data = { ...this.data, group: event.detail };
    // });

    const titleInput = document.querySelector('ir-input-text#title-input');
    titleInput.addEventListener('textChange', (event: CustomEvent) => {
      this.connected = false;
      this.connectionOff.emit();
      this.data = { ...this.data, title: event.detail };
      this.sendToParent.emit(this.data);
    });

    const propertySelect = document.querySelector('ir-select#property-select');
    propertySelect.addEventListener('selectChange', (event: CustomEvent) => {
      this.connected = false;
      this.connectionOff.emit();
      this.data = { ...this.data, property: event.detail };
      this.sendToParent.emit(this.data);
    });
  }

  testConnection() {
    // check if all data is filled
    if (!this.data.hotelId) {
      const alertModal: any = document.querySelector('ir-modal.alertFields');
      alertModal.openModal();
    } else {
      this.testLoader = true;
      setTimeout(() => {
        this.testLoader = false;
        if (this.data.hotelId == '123456') {
          this.connected = true;
          this.connectionStatus = ' Connected';

          this.sendToParent.emit(this.data);
        } else {
          this.connected = false;
        }
      }, 1000);
    }
  }

  render() {
    return [
      <div class="General Settings font-size-small">
        <div class="container-fluid">
          {this.mode == 'edit' && <div class="text-light border-bottom-light mb-2">{`ID ${this.data.id}`}</div>}
          <div class="column">
            <ir-select
              class="channel-select"
              label="Channel"
              data={this.allowed_channels}
              label-background="white"
              label-position="right"
              label-border="none"
              size="sm"
              textSize="sm"
              labelWidth={4}
              selectedValue={this.data !== null ? this.data.channel : null}
            />
            {/* <ir-select
              id="group-select"
              label="Group"
              // placeholder="Group"
              data={[{ value: 'all', text: 'All' }]}
              label-background="white"
              label-position="right"
              label-border="none"
              size="sm"
              textSize="sm"
              labelWidth={4}
              selectedValue={this.data !== null ? this.data.group : null}
            /> */}
            <ir-input-text
              id="title-input"
              label="Title"
              placeholder="Title"
              value={this.data !== null ? this.data.title : null}
              label-background="white"
              label-position="right"
              label-border="none"
              size="sm"
              labelWidth={4}
            />
            <ir-select
              id="property-select"
              label="Propery"
              // placeholder="Propery"
              data={this.allowed_properties}
              label-background="white"
              label-position="right"
              label-border="none"
              size="sm"
              textSize="sm"
              labelWidth={4}
              selectedValue={this.data !== null ? this.data.property : null}
            />
          </div>
        </div>
        {/* {this.selectedChannel && (
          <div class="container-fluid mt-1">
            <div class="text-light border-bottom-light mb-2">Connection Settings</div>
            <div class="row">
              <ir-input-text
                id={'hotel-id'}
                label="Hotel ID"
                placeholder="Hotel ID"
                value={this.data !== null ? this.data.hotelId : null}
                label-background="white"
                label-position="right"
                label-border="none"
                size="sm"
                labelWidth={4}
                class="col-12"
              />
              <ir-select
                id="minimum-stay-select"
                label="Minimum Stay Type"
                data={this.allowed_MinStayTypes}
                label-background="white"
                label-position="right"
                label-border="none"
                size="sm"
                textSize="sm"
                class="col-12"
                labelWidth={4}
                selectedValue={this.data !== null ? this.data.minimumStay : null}
              />
              <div class="col-12 pb-1 ">
                <div class="row">
                  <div class="col-4"></div>
                  <div class="col-8 d-flex justify-content-between align-items-center">
                    <div>
                      {this.testLoader ? (
                        <ir-loader size="xs"></ir-loader>
                      ) : (
                        <span>
                          <ir-icon class="test-icon" icon={this.connected ? 'ft-check-circle success' : 'ft-alert-triangle warning'}></ir-icon>
                          {this.connected ? 'Connected' : 'Not Connected'}
                        </span>
                      )}
                    </div>
                    {!this.connected && (
                      <button onClick={() => this.testConnection()} class="btn btn-white border-light btn-sm text-dark ">
                        Test Connection
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )} */}
      </div>,
      <ir-modal
        class="alertFields"
        modalTitle="Please fill all the fields!"
        modalBody="There are fields that are not filled yet."
        iconAvailable={true}
        icon="ft-alert-circle warning h1"
        leftBtnActive={false}
        btnPosition="center"
        rightBtnText="Close"
        rightBtnColor="primary"
      ></ir-modal>,
    ];
  }
}
