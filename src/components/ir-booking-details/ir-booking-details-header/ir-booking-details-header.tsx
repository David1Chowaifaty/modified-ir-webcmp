import locales from '@/stores/locales.store';
import { Component, Event, EventEmitter, Fragment, Host, Listen, Prop, State, h } from '@stencil/core';
import { Booking } from '@/models/booking.dto';
import { _formatDate, _formatTime } from '../functions';
import calendar_data from '@/stores/calendar-data';
import { colorVariants } from '@/components/ui/ir-icons/icons';
import { isRequestPending } from '@/stores/ir-interceptor.store';
import axios from 'axios';
import { IToast } from '@/components/ir-toast/toast';

@Component({
  tag: 'ir-booking-details-header',
  styleUrl: 'ir-booking-details-header.css',
  scoped: true,
})
export class IrBookingDetailsHeader {
  @Prop() booking: Booking;
  @Prop() hasPrint = false;
  @Prop() hasReceipt = false;
  @Prop() hasDelete = false;
  @Prop() hasMenu = false;
  @Prop() hasRoomEdit = false;
  @Prop() hasRoomDelete = false;
  @Prop() hasRoomAdd = false;
  @Prop() hasCheckIn = false;
  @Prop() hasCheckOut = false;
  @Prop() hasCloseButton = false;

  @State() tempStatus: string = null;

  @Event() closeSidebar: EventEmitter<null>;
  @Event() toast: EventEmitter<IToast>;
  @Event() resetBookingData: EventEmitter<null>;
  @Event() openPMSLogsDialog: EventEmitter<null>;

  @Listen('selectChange')
  handleSelectChange(e: CustomEvent<any>) {
    e.stopPropagation();
    e.stopImmediatePropagation();
    const target = e.target;
    this.tempStatus = (target as any).selectedValue;
  }

  private getBadgeColor() {
    let confirmationBG = '';
    switch (this.booking.status.code) {
      case '001':
        confirmationBG = 'orange';
        break;
      case '002':
        confirmationBG = 'green';
        break;
      case '003':
        confirmationBG = 'red';
        break;
      case '004':
        confirmationBG = 'red';
        break;
    }
    return confirmationBG;
  }

  private handleSidebarClose(e: CustomEvent) {
    e.stopPropagation();
    e.stopImmediatePropagation();
    this.closeSidebar.emit(null);
  }

  private async updateStatus() {
    if (this.tempStatus !== '' && this.tempStatus !== null) {
      try {
        await axios.post(`/Change_Exposed_Booking_Status?Ticket=${calendar_data.token}`, {
          book_nbr: this.booking.booking_nbr,
          status: this.tempStatus,
        });
        this.tempStatus = null;
        this.toast.emit({
          type: 'success',
          description: '',
          title: locales.entries.Lcz_StatusUpdatedSuccessfully,
          position: 'top-right',
        });
        this.resetBookingData.emit(null);
      } catch (error) {
        console.log(error);
      }
    } else {
      this.toast.emit({
        type: 'error',
        description: '',
        title: locales.entries.Lcz_SelectStatus,
        position: 'top-right',
      });
    }
  }

  render() {
    const isUpdateBookingLoading = isRequestPending('/Change_Exposed_Booking_Status');
    return (
      <Host>
        <div class="fluid-container p-1">
          <div class="d-flex flex-column p-0 mx-0 flex-lg-row align-items-md-center justify-content-between mt-1">
            <div class="m-0 p-0 mb-1 mb-lg-0 mt-md-0  d-flex justify-content-start align-items-center">
              <p class="font-size-large m-0 p-0">{`${locales.entries.Lcz_Booking}#${this.booking.booking_nbr}`}</p>
              <p class="m-0 p-0 ml-1">
                {!this.booking.is_direct && <span class="mr-1 m-0">{this.booking.channel_booking_nbr}</span>}
                <span class="date-margin">{_formatDate(this.booking.booked_on.date)}</span>
                {_formatTime(this.booking.booked_on.hour.toString(), this.booking.booked_on.minute.toString())}
              </p>
            </div>

            <div class="d-flex justify-content-end align-items-center">
              <span class={`badge  m-0 mr-2 ${this.getBadgeColor()}`}>{this.booking.status.description}</span>
              {this.booking.allowed_actions.length > 0 && this.booking.is_editable && (
                <Fragment>
                  <ir-select
                    selectContainerStyle="h-28"
                    selectStyles="d-flex status-select align-items-center h-28"
                    firstOption={locales.entries.Lcz_Select}
                    id="update-status"
                    size="sm"
                    label-available="false"
                    data={this.booking.allowed_actions.map(b => ({ text: b.description, value: b.code }))}
                    textSize="sm"
                    class="sm-padding-right m-0 "
                  ></ir-select>
                  <ir-button
                    onClickHanlder={this.updateStatus.bind(this)}
                    btn_styles="h-28"
                    isLoading={isUpdateBookingLoading}
                    btn_disabled={isUpdateBookingLoading}
                    id="update-status-btn"
                    size="sm"
                    text="Update"
                  ></ir-button>
                </Fragment>
              )}
              {calendar_data.is_pms_enabled && (
                <button type="button" class="btn btn-outline btn-sm ml-1" onClick={() => this.openPMSLogsDialog.emit(null)}>
                  {locales.entries.Lcz_pms}
                </button>
              )}
              {this.hasReceipt && <ir-button variant="icon" id="receipt" icon_name="reciept" class="mx-1" style={{ '--icon-size': '1.65rem' }}></ir-button>}
              {this.hasPrint && <ir-button variant="icon" id="print" icon_name="print" class="mr-1" style={{ '--icon-size': '1.65rem' }}></ir-button>}
              {this.hasDelete && (
                <ir-button variant="icon" id="book-delete" icon_name="trash" class="mr-1" style={{ ...colorVariants.danger, '--icon-size': '1.65rem' }}></ir-button>
              )}
              {this.hasMenu && <ir-button variant="icon" class="mr-1" id="menu" icon_name="menu_list" style={{ '--icon-size': '1.65rem' }}></ir-button>}

              {this.hasCloseButton && (
                <ir-button
                  id="close"
                  variant="icon"
                  style={{ '--icon-size': '1.65rem' }}
                  icon_name="xmark"
                  class="ml-2"
                  onClickHanlder={this.handleSidebarClose.bind(this)}
                ></ir-button>
              )}
            </div>
          </div>
        </div>
      </Host>
    );
  }
}
