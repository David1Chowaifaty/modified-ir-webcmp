import { Booking } from '@/models/booking.dto';
import { Component, Fragment, Prop, State, h } from '@stencil/core';
import { BookingEditorMode, BookingStep } from './types';
import { ToastHelper } from '@/components/ir-toast-provider/ToastHelper';

@Component({
  tag: 'ir-booking-editor',
  styleUrl: 'ir-booking-editor.css',
  scoped: true,
})
export class IrBookingEditor {
  @Prop({ reflect: true }) open: boolean;
  @Prop() language: string = 'en';
  @Prop() booking: Booking;
  @Prop() mode: BookingEditorMode = 'PLUS_BOOKING';
  @Prop() checkIn: string;
  @Prop() checkOut: string;

  @State() step: BookingStep = 'details';

  private goToConfirm = (e?: CustomEvent) => {
    e?.stopPropagation();
    this.step = 'confirm';
  };

  private goToDetails = () => {
    this.step = 'details';
  };

  private renderDetailsActions() {
    return (
      <Fragment>
        <ir-custom-button data-drawer="close" size="medium" appearance="filled" variant="neutral">
          Cancel
        </ir-custom-button>

        <ir-custom-button onClickHandler={this.goToConfirm} size="medium" appearance="accent" variant="brand">
          Next
        </ir-custom-button>
      </Fragment>
    );
  }

  private renderConfirmActions() {
    return (
      <Fragment>
        <ir-custom-button onClickHandler={this.goToDetails} size="medium" appearance="filled" variant="neutral">
          Back
        </ir-custom-button>

        <ir-custom-button type="submit" size="medium" appearance="accent" variant="brand">
          Book
        </ir-custom-button>

        <ir-custom-button type="submit" size="medium" appearance="accent" variant="brand">
          Book and check-in
        </ir-custom-button>
      </Fragment>
    );
  }

  private renderFooter() {
    switch (this.step) {
      case 'details':
        return this.renderDetailsActions();
      case 'confirm':
        return this.renderConfirmActions();
      default:
        return null;
    }
  }

  private get label() {
    switch (this.mode) {
      case 'SPLIT_BOOKING':
      case 'BAR_BOOKING':
      case 'ADD_ROOM':
      case 'EDIT_BOOKING':
      case 'PLUS_BOOKING':
        return 'New Booking';
    }
  }

  render() {
    return (
      <ir-drawer label={this.label} open={this.open}>
        {/* Header */}
        <div>{/* <ir-booking-editor-header booking={this.booking} checkIn={this.checkIn} checkOut={this.checkOut} mode={this.mode} /> */}</div>

        {/* Content */}
        <div>
          <button onClick={async () => await ToastHelper.success('Item saved successfully!')}>click</button>

          {this.step === 'details' && <p>details</p>}

          {this.step === 'confirm' && <p>confirm</p>}
        </div>

        {/* Footer */}
        <div slot="footer" class="ir__drawer-footer">
          {this.renderFooter()}
        </div>
      </ir-drawer>
    );
  }
}
