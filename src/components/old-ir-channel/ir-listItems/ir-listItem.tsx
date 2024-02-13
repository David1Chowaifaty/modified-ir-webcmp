import { Component, h, Prop, Event, EventEmitter, State, Listen } from '@stencil/core';
import { emptyState } from '../../../sample/channel/images';
import { ChannelManager } from '../../../sample/channel/data';

@Component({
  tag: 'ir-list-item',
})
export class IrListItem {
  @State() type: string = '';
  @Prop({ reflect: true }) dropdownData: {
    name: string;
    icon: string;
    children: {
      name: string;
      icon: string;
    }[];
  } = {
    name: 'Action',
    icon: '',
    children: [
      {
        name: 'Edit',
        icon: 'ft-edit',
      },
      {
        name: 'Delete',
        icon: 'ft-trash',
      },
      {
        name: 'Disable',
        icon: 'ft-alert-triangle',
      },
    ],
  };

  @Prop({ reflect: true }) dropdownDataDisable: {
    name: string;
    icon: string;
    children: {
      name: string;
      icon: string;
    }[];
  } = {
    name: 'Action',
    icon: '',
    children: [
      {
        name: 'Edit',
        icon: 'ft-edit',
      },
      {
        name: 'Delete',
        icon: 'ft-trash',
      },
      {
        name: 'Enable',
        icon: 'ft-check',
      },
    ],
  };

  @Prop({ reflect: true }) listData: ChannelManager[] = null;

  @Event() sendDelete: EventEmitter;

  addEventListenerToDropdown(item: any) {
    const dropdown = document.querySelector(`ir-dropdown.dropdown-action-${item.id}`);
    if (dropdown) {
      const eventHandler = (e: CustomEvent) => {
        if (e.detail.name === 'Edit') {
          this.handleCreate('edit', item);
        } else if (e.detail.name === 'Delete') {
          this.onPressDelete(item);
        } else if (e.detail.name === 'Disable') {
          this.onPressDisable(item);
        } else if (e.detail.name === 'Enable') {
          this.onPressDisable(item);
        }
      };

      dropdown.addEventListener('dropdownItemCLicked', eventHandler);
    }
  }

  @Event() openSidebar: EventEmitter;
  @Event() createNew: EventEmitter;
  @Event() changeStatus: EventEmitter;

  handleCreate(mode: string, item: any) {
    this.openSidebar.emit({ mode: mode, item: item });
  }

  onPressDelete(item: any) {
    this.type = 'delete';
    const modal = document.querySelector(`ir-modal`);
    if (modal) {
      modal.item = item;
      modal.openModal();
    }
  }

  @Listen('confirmModal')
  doAction(event: CustomEvent) {
    const item = event.detail;
    if (this.type === 'delete') {
      this.listData = this.listData.filter(data => data.id !== item.id);
      this.sendDelete.emit(this.listData);
    } else if (this.type === 'disable') {
      this.listData = this.listData.map(data => {
        if (data.id === item.id) {
          data.status = 'Disabled';
          this.changeStatus.emit(this.listData);
        }
        return data;
      });
    } else if (this.type === 'enable') {
      this.listData = this.listData.map(data => {
        if (data.id === item.id) {
          data.status = 'Active';
          this.changeStatus.emit(this.listData);
        }
        return data;
      });
    }
    const modal = document.querySelector(`ir-modal`);
    if (modal) {
      modal.closeModal();
    }
  }

  onPressDisable(item: any) {
    this.type = item.status === 'Active' ? 'disable' : 'enable';
    const modal = document.querySelector(`ir-modal`);
    if (modal) {
      modal.openModal();
      modal.item = item;
    }
  }

  componentDidLoad() {
    if (this.listData !== null) {
      this.listData.forEach(item => {
        this.addEventListenerToDropdown(item);
      });
    }
  }

  componentDidUpdate() {
    if (this.listData !== null) {
      this.listData.forEach(item => {
        this.addEventListenerToDropdown(item);
      });
    }
  }

  // disconnectedCallback() {
  //   this.listData.forEach(item => {
  //     const dropdown = document.querySelector(`ir-dropdown.dropdown-action-${item.id}`);
  //     if (dropdown) {
  //       dropdown.removeEventListener('dropdownItemCLicked', this.handleCreate);
  //     }
  //   });
  // }

  _renderEmptyState() {
    return (
      <div class="cardBody">
        <div class="emptyBody">
          <img src={emptyState} alt="empty" class="img-fluid emptyImg" />
          <p class="font-size-small">
            You don't have any channels yet.
            <br />
            It's a good time to create
            <a class="text-primary openSidebar" onClick={() => this.createNew.emit({ mode: 'create', item: null })}>
              {' '}
              new
            </a>
          </p>
        </div>
      </div>
    );
  }

  _renderItem() {
    return (
      <div>
        <div class="container-fluid">
          {this.listData.map(item => {
            return (
              <div class="row">
                <div class="col-12 item-info">
                  <div class="row">
                    <div class="col-3 p-1">{item.title}</div>
                    <div class="col-3 p-1">{item.channel}</div>
                    <div class="col-3 p-1">{item.status}</div>
                    <div class="col-3 ">
                      <ir-dropdown class={`dropdown-action-${item.id}`} data={item.status === 'Active' ? this.dropdownData : this.dropdownDataDisable} object={item}></ir-dropdown>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  _confirmDelete() {
    return (
      <div class="row">
        <div class="col-2 d-flex justify-content-center align-items-center">
          <ir-icon icon="ft-trash danger h1"></ir-icon>
        </div>
        <div class="col-10">
          <div class="font-weight-bold">Are you sure you want to delete?</div>
          <br />
          <div class="font-size-small">What you delete here will be permanently deleted.</div>
        </div>
      </div>
    );
  }

  _enable_disable() {
    return (
      <div class="row">
        <div class="col-2 d-flex justify-content-center align-items-center">
          <ir-icon icon="ft-alert-circle warning h1"></ir-icon>
        </div>
        <div class="col-10">
          <div class="font-weight-bold">Would you like to {this.type} this channel?</div>
          <br />
        </div>
      </div>
    );
  }

  render() {
    return [
      this.listData !== null && this.listData.length > 0 ? this._renderItem() : this._renderEmptyState(),
      <ir-modal
        modalTitle={this.type === 'delete' ? 'Are you sure you want to delete?' : `Would you like to ${this.type} this channel?`}
        modalBody={this.type === 'delete' ? 'What you delete here will be permanently deleted.' : `This channel will be ${this.type}d.`}
        icon="ft-trash warning h1"
        iconAvailable={true}
      ></ir-modal>,
    ];
  }
}
