import { Component, Event, EventEmitter, h, Prop } from '@stencil/core';

@Component({
  tag: 'igl-blocked-date-dialog',
  styleUrl: 'igl-blocked-date-dialog.css',
  scoped: true,
})
export class IglBlockedDateDialog {
  @Prop({ reflect: true }) open: boolean;
  @Prop() label: string;
  @Prop() fromDate: string;
  @Prop() toDate: string;
  @Event() blockedDateDialogClosed: EventEmitter<void>;
  render() {
    return (
      <ir-drawer
        label={this.label}
        onDrawerHide={e => {
          e.stopImmediatePropagation();
          e.stopPropagation();
          this.blockedDateDialogClosed.emit();
        }}
        open={this.open}
      >
        {this.open && <igl-block-dates-view onDataUpdateEvent={e => console.log(e.detail)} fromDate={this.fromDate} toDate={this.toDate}></igl-block-dates-view>}
        <div slot="footer" class="ir__drawer-footer">
          <ir-custom-button data-dialog="close" size="medium" appearance="filled" variant="neutral">
            Cancel
          </ir-custom-button>
          <ir-custom-button size="medium" appearance="accent" variant="brand">
            Save
          </ir-custom-button>
        </div>
      </ir-drawer>
    );
  }
}
