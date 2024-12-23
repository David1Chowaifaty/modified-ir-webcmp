import { IToast } from '@/components/ir-toast/toast';
import { colorVariants } from '@/components/ui/ir-icons/icons';
import { Booking } from '@/models/booking.dto';
import calendar_data from '@/stores/calendar-data';
import { isRequestPending } from '@/stores/ir-interceptor.store';
import locales from '@/stores/locales.store';
import { Component, Event, EventEmitter, h, Listen, Prop, State } from '@stencil/core';
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

  @State() bookingStatus: string | null;
  @State() currentDialogStatus: BookingDetailsDialogEvents;

  @Event() toast: EventEmitter<IToast>;
  @Event() closeSidebar: EventEmitter<null>;
  @Event() resetbooking: EventEmitter<null>;
  @Event() openSidebar: EventEmitter<OpenSidebarEvent>;

  private confirmationBG = {
    '001': 'bg-ir-orange',
    '002': 'bg-ir-green',
    '003': 'bg-ir-red',
    '004': 'bg-ir-red',
  };
  private dialogRef: HTMLIrDialogElement;

  private bookingService = new BookingService();

  @Listen('selectChange')
  handleSelectChange(e: CustomEvent<any>) {
    e.stopPropagation();
    e.stopImmediatePropagation();
    const target = e.target;
    this.bookingStatus = (target as any).selectedValue;
  }
  private async updateStatus() {
    if (this.bookingStatus !== '' && this.bookingStatus !== null) {
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
        this.resetbooking.emit(null);
      } catch (error) {
        console.log(error);
      } finally {
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
  private openDialog(e: OpenDialogEvent) {
    const { type } = e;
    this.currentDialogStatus = type;
    this.dialogRef.openModal();
  }
  private renderDialogBody() {
    switch (this.currentDialogStatus) {
      case 'pms':
        return <ir-pms-logs slot="modal-body" bookingNumber={this.booking.booking_nbr}></ir-pms-logs>;
      case 'revisions':
        return <ir-revisions slot="modal-body"></ir-revisions>;
    }
  }

  render() {
    return (
      <div class="fluid-container p-1">
        <div class="d-flex flex-column p-0 mx-0 flex-lg-row align-items-md-center justify-content-between mt-1">
          <div class="m-0 p-0 mb-1 mb-lg-0 mt-md-0">
            <p class="font-size-large m-0 p-0">{`${locales.entries.Lcz_Booking}#${this.booking.booking_nbr}`}</p>
            <p class="m-0 p-0">{!this.booking.is_direct && <span class="mr-1 m-0">{this.booking.channel_booking_nbr}</span>}</p>
          </div>

          <div class="d-flex justify-content-end align-items-center" style={{ gap: '1rem' }}>
            <span class={`confirmed btn-sm m-0  ${this.confirmationBG[this.booking.status.code]}`}>{this.booking.status.description}</span>
            {this.booking.allowed_actions.length > 0 && this.booking.is_editable && (
              <div class="m-0 p-0 d-flex align-items-center" style={{ gap: '0.25rem' }}>
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
                  isLoading={isRequestPending('/Change_Exposed_Booking_Status')}
                  btn_disabled={isRequestPending('/Change_Exposed_Booking_Status')}
                  id="update-status-btn"
                  size="sm"
                  text="Update"
                ></ir-button>
              </div>
            )}
            <button type="button" class="btn btn-outline btn-sm m-0" onClick={() => this.openDialog({ type: 'revisions' })}>
              {'Revisions'}
            </button>
            {calendar_data.is_pms_enabled && (
              <button type="button" class="btn btn-outline btn-sm m-0" onClick={() => this.openDialog({ type: 'pms' })}>
                {locales.entries.Lcz_pms}
              </button>
            )}
            {this.hasReceipt && <ir-button variant="icon" id="receipt" icon_name="reciept" class="" style={{ '--icon-size': '1.65rem' }}></ir-button>}
            {this.hasPrint && <ir-button variant="icon" id="print" icon_name="print" class="" style={{ '--icon-size': '1.65rem' }}></ir-button>}
            {this.hasDelete && <ir-button variant="icon" id="book-delete" icon_name="trash" class="" style={{ ...colorVariants.danger, '--icon-size': '1.65rem' }}></ir-button>}
            {this.hasMenu && <ir-button variant="icon" class="mr-1" id="menu" icon_name="menu_list" style={{ '--icon-size': '1.65rem' }}></ir-button>}

            {this.hasCloseButton && (
              <ir-button
                id="close"
                variant="icon"
                style={{ '--icon-size': '1.65rem' }}
                icon_name="xmark"
                class="ml-2"
                onClickHanlder={e => {
                  e.stopPropagation();
                  e.stopImmediatePropagation();
                  this.closeSidebar.emit(null);
                }}
              ></ir-button>
            )}
          </div>
        </div>
        <ir-dialog
          onOpenChange={e => {
            if (!e.detail) {
              this.currentDialogStatus = null;
            }
          }}
          ref={el => (this.dialogRef = el)}
        >
          {this.renderDialogBody()}
        </ir-dialog>
      </div>
    );
  }
}
