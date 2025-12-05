import { IToast } from '@/components/ui/ir-toast/toast';
import { Booking } from '@/models/booking.dto';
import { isRequestPending } from '@/stores/ir-interceptor.store';
import locales from '@/stores/locales.store';
import { Component, Event, EventEmitter, Fragment, h, Listen, Prop, State } from '@stencil/core';
import { BookingDetailsDialogEvents, OpenDialogEvent, OpenSidebarEvent } from '../types';
import { BookingService } from '@/services/booking.service';

@Component({
  tag: 'ir-booking-header',
  styleUrl: 'ir-booking-header.css',
  scoped: true,
})
export class IrBookingHeader {
  @Prop() booking: Booking;
  @Prop() hasReceipt: boolean;
  @Prop() hasPrint: boolean;
  @Prop() hasDelete: boolean;
  @Prop() hasMenu: boolean;
  @Prop() hasCloseButton: boolean;
  @Prop() hasEmail: boolean = true;

  @State() bookingStatus: string | null = null;
  @State() currentDialogStatus: BookingDetailsDialogEvents;

  @Event() toast: EventEmitter<IToast>;
  @Event() closeSidebar: EventEmitter<null>;
  @Event() resetBookingEvt: EventEmitter<null>;
  @Event() openSidebar: EventEmitter<OpenSidebarEvent<any>>;

  // private confirmationBG = {
  //   '001': 'bg-ir-orange',
  //   '002': 'bg-ir-green',
  //   '003': 'bg-ir-red',
  //   '004': 'bg-ir-red',
  // };

  private dialogRef: HTMLIrDialogElement;

  private bookingService = new BookingService();
  private alertMessage = `ALERT! Modifying an OTA booking will create a discrepancy between igloorooms and the source. Future guest modifications on the OTA may require manual adjustments of the booking.`;
  private modalEl: HTMLIrDialogElement;

  @Listen('selectChange')
  handleSelectChange(e: CustomEvent<any>) {
    e.stopPropagation();
    e.stopImmediatePropagation();
    const target = e.target;
    this.bookingStatus = (target as any).selectedValue;
  }
  private async updateStatus() {
    if (!this.bookingStatus || this.bookingStatus === '-1') {
      this.toast.emit({
        type: 'error',
        description: '',
        title: locales.entries.Lcz_SelectStatus,
        position: 'top-right',
      });
      return;
    }
    try {
      await this.bookingService.changeExposedBookingStatus({
        book_nbr: this.booking.booking_nbr,
        status: this.bookingStatus,
      });
      this.toast.emit({
        type: 'success',
        description: '',
        title: locales.entries.Lcz_StatusUpdatedSuccessfully,
        position: 'top-right',
      });
      this.bookingStatus = null;
      this.resetBookingEvt.emit(null);
    } catch (error) {
      console.log(error);
    }
  }
  private openDialog(e: OpenDialogEvent) {
    const { type } = e;
    this.currentDialogStatus = type;
    this.dialogRef.openModal();
  }
  private renderDialogBody() {
    switch (this.currentDialogStatus) {
      case 'pms':
        return <ir-pms-logs bookingNumber={this.booking.booking_nbr}></ir-pms-logs>;
      case 'events-log':
        return <ir-events-log booking={this.booking} bookingNumber={this.booking.booking_nbr}></ir-events-log>;
    }
  }

  render() {
    const lastManipulation = this.booking.ota_manipulations ? this.booking.ota_manipulations[this.booking.ota_manipulations.length - 1] : null;
    return (
      <div class="fluid-container px-1">
        <div class="d-flex flex-column p-0 mx-0 flex-lg-row align-items-md-center justify-content-between">
          <div class="m-0 p-0 mb-1 mb-lg-0 mt-md-0">
            <p style={{ color: 'black' }} class="font-size-large m-0 p-0">{`${locales.entries.Lcz_Booking}#${this.booking.booking_nbr}`}</p>
            <p class="m-0 p-0">{!this.booking.is_direct && <span class="mr-1 m-0">{this.booking.channel_booking_nbr}</span>}</p>
          </div>

          <div class="d-flex justify-content-end align-items-center" style={{ gap: '1rem', flexWrap: 'wrap' }}>
            <div class="d-flex flex-column align-items-center">
              {/* <span class={`confirmed btn-sm m-0  ${this.confirmationBG[this.booking.is_requested_to_cancel ? '003' : this.booking.status.code]}`}>
                {this.booking.is_requested_to_cancel ? locales.entries.Lcz_CancellationRequested : this.booking.status.description}
              </span> */}
              <ir-booking-status-tag status={this.booking.status} isRequestToCancel={this.booking.is_requested_to_cancel}></ir-booking-status-tag>
              {lastManipulation && (
                <ir-popover
                  trigger="hover"
                  renderContentAsHtml
                  content={`<div><p>Modified by ${lastManipulation.user} at ${lastManipulation.date} ${lastManipulation.hour}:${lastManipulation.minute}.</p>
                <p>${this.alertMessage}</p></div>`}
                >
                  <p class="mx-0 p-0 small text-danger" style={{ marginTop: '0.25rem', marginBottom: '0' }}>
                    <b>Modified</b>
                  </p>
                </ir-popover>
              )}
            </div>
            {this.booking.allowed_actions.length > 0 && this.booking.is_editable && (
              <div class="m-0 p-0 d-flex align-items-center" style={{ gap: '0.25rem' }}>
                {/* <ir-select
                  selectContainerStyle="h-28"
                  selectStyles="d-flex status-select align-items-center h-28"
                  firstOption={locales.entries.Lcz_Select}
                  id="update-status"
                  size="sm"
                  label-available="false"
                  data={this.booking.allowed_actions.map(b => ({ text: b.description, value: b.code }))}
                  textSize="sm"
                  class="sm-padding-right m-0 "
                  selectedValue={this.bookingStatus}
                ></ir-select> */}
                <wa-select
                  onchange={e => {
                    this.bookingStatus = (e.target as any).value;
                  }}
                  style={{ width: '120px' }}
                  size="small"
                  placeholder="Select..."
                  value={this.bookingStatus ?? ''}
                >
                  <wa-option value="">Select...</wa-option>
                  {this.booking.allowed_actions.map(option => (
                    <wa-option value={option.code}>{option.description}</wa-option>
                  ))}
                </wa-select>
                <ir-custom-button
                  onClickHandler={() => {
                    if (!this.booking.is_direct) {
                      this.modalEl.openModal();
                      return;
                    }
                    this.updateStatus();
                  }}
                  loading={isRequestPending('/Change_Exposed_Booking_Status')}
                  appearance={'accent'}
                  size="small"
                  variant="brand"
                >
                  Update
                </ir-custom-button>
              </div>
            )}
            <ir-custom-button
              onClickHandler={e => {
                e.stopImmediatePropagation();
                e.stopPropagation();
                this.openDialog({ type: 'events-log' });
              }}
              appearance={'outlined'}
              size="small"
              variant="brand"
            >
              Events log
            </ir-custom-button>
            <ir-custom-button
              onClickHandler={e => {
                e.stopImmediatePropagation();
                e.stopPropagation();
                this.openDialog({ type: 'pms' });
              }}
              appearance={'outlined'}
              size="small"
              variant="brand"
            >
              PMS
            </ir-custom-button>

            {this.hasReceipt && (
              <Fragment>
                <wa-tooltip for="invoice">Print invoice</wa-tooltip>
                <ir-custom-button id="invoice" variant="neutral" size="small" appearance="plain">
                  <wa-icon name="file-invoice" label="invoice" style={{ fontSize: '1.65rem' }}></wa-icon>
                </ir-custom-button>
              </Fragment>
            )}
            {this.hasPrint && (
              <Fragment>
                <wa-tooltip for="print">Print booking</wa-tooltip>
                <ir-custom-button id="print" variant="neutral" size="small" appearance="plain">
                  <wa-icon label="Print" name="print" style={{ fontSize: '1.65rem' }}></wa-icon>
                </ir-custom-button>
              </Fragment>
            )}

            {this.hasEmail && (
              <Fragment>
                <wa-tooltip for="email">Email this booking</wa-tooltip>
                <ir-custom-button id="email" variant="neutral" size="small" appearance="plain">
                  <wa-icon name="envelope" style={{ fontSize: '1.65rem' }} label="Email this booking"></wa-icon>
                </ir-custom-button>
              </Fragment>
            )}
            {this.hasDelete && (
              <Fragment>
                <wa-tooltip for="book-delete">Delete this booking</wa-tooltip>
                <ir-custom-button id="book-delete" variant="danger" size="small" appearance="plain">
                  <wa-icon name="envelope" style={{ fontSize: '1.65rem' }} label="Email this booking"></wa-icon>
                </ir-custom-button>
              </Fragment>
            )}
            {this.hasMenu && (
              <Fragment>
                <wa-tooltip for="menu">Go back</wa-tooltip>
                <ir-custom-button id="menu" variant="neutral" size="small" appearance="plain">
                  <wa-icon name="list" style={{ fontSize: '1.65rem' }} label="Go back"></wa-icon>
                </ir-custom-button>
              </Fragment>
            )}
            {this.hasCloseButton && (
              <ir-custom-button
                onClickHandler={e => {
                  e.stopPropagation();
                  e.stopImmediatePropagation();
                  this.closeSidebar.emit(null);
                }}
                id="close"
                variant="neutral"
                size="small"
                appearance="plain"
              >
                <wa-icon name="xmark" style={{ fontSize: '1.65rem' }} label="Go back"></wa-icon>
              </ir-custom-button>
            )}
          </div>
        </div>
        <ir-dialog
          onIrDialogHide={_ => {
            this.currentDialogStatus = null;
          }}
          label={this.currentDialogStatus === 'pms' ? locales.entries.Lcz_PMS_Logs : locales.entries.Lcz_EventsLog}
          style={this.currentDialogStatus === 'events-log' && { '--ir-dialog-max-width': 'max-content' }}
          ref={el => (this.dialogRef = el)}
        >
          {this.renderDialogBody()}
        </ir-dialog>

        <ir-dialog
          ref={el => (this.modalEl = el)}
          label="Alert"
          lightDismiss={false}
          onIrDialogHide={e => {
            e.stopImmediatePropagation();
            e.stopPropagation();
          }}
        >
          <p>{locales.entries.Lcz_OTA_Modification_Alter}</p>
          <div class="ir-dialog__footer">
            <ir-custom-button data-dialog="close" size="medium" appearance="filled" variant="neutral">
              {locales?.entries?.Lcz_Cancel}
            </ir-custom-button>
            <ir-custom-button
              onClickHandler={e => {
                e.stopImmediatePropagation();
                e.stopPropagation();
                this.updateStatus();
              }}
              size="medium"
              variant="danger"
              loading={isRequestPending('/Change_Exposed_Booking_Status')}
            >
              {locales?.entries?.Lcz_Confirm}
            </ir-custom-button>
          </div>
        </ir-dialog>
      </div>
    );
  }
}
