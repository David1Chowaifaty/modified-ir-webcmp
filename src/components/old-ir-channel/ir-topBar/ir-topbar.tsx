import { Component, h, Event, EventEmitter } from '@stencil/core';

@Component({
  tag: 'ir-topbar',
})
export class IrChannelManager {
  @Event({ bubbles: true, composed: true }) openSidebar: EventEmitter;

  handleCreate() {
    this.openSidebar.emit();
  }

  render() {
    return (
      <div class="card-head">
        <div class="input-group input-group-sm">
          <input type="text" class="form-control border-light" placeholder="Search" />
          <div class="input-group-append">
            {/* <button class="btn border-light btn-sm bg-white" type="button">
                  <ir-icon icon="ft-filter"></ir-icon> Advanced Seach
                </button> */}
          </div>
          <button class="ml-1 btn btn-primary btn-sm openSidebar" onClick={() => this.handleCreate()}>
            Create
          </button>
        </div>
        <div class="container-fluid">
          <div class="row">
            <div class="col-3 p-1 section-title">
              Title <ir-icon icon="la la-unsorted"></ir-icon>
            </div>
            <div class="col-3 p-1 section-title">
              Channel <ir-icon icon="la la-unsorted"></ir-icon>
            </div>
            <div class="col-3 p-1 section-title">
              Status <ir-icon icon="la la-unsorted"></ir-icon>
            </div>
            {/* <div class="col-3 p-1 section-title">
                  Actions <ir-icon icon="la la-unsorted"></ir-icon>
                </div> */}
          </div>
        </div>
      </div>
    );
  }
}
