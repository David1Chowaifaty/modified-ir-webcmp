import { Component, Event, EventEmitter, Host, Prop, h } from '@stencil/core';
import { ExtraService } from '@/models/booking.dto';
import { formatAmount } from '@/utils/utils';
import locales from '@/stores/locales.store';
import moment from 'moment';
import { BookingService } from '@/services/booking-service/booking.service';
import { isRequestPending } from '@/stores/ir-interceptor.store';

@Component({
  tag: 'ir-extra-service',
  styleUrl: 'ir-extra-service.css',
  scoped: true,
})
export class IrExtraService {
  @Prop() service: ExtraService;
  @Prop() bookingNumber: string;
  @Prop() currencySymbol: string;

  @Event() editExtraService: EventEmitter<ExtraService>;
  @Event() resetBookingEvt: EventEmitter<null>;

  private irModalRef: HTMLIrDialogElement;
  private bookingService = new BookingService();

  private async deleteService() {
    try {
      await this.bookingService.doBookingExtraService({
        service: this.service,
        is_remove: true,
        booking_nbr: this.bookingNumber,
      });
      this.irModalRef.closeModal();
      this.resetBookingEvt.emit(null);
    } catch (error) {
      console.log(error);
    }
  }
  render() {
    return (
      <Host>
        <div>
          <div class={'extra-service-container'}>
            <p class="extra-service-description">{this.service.description}</p>
            <div class="extra-service-actions">
              {!!this.service.price && this.service.price > 0 && (
                <p class="extra-service-price p-0 m-0 font-weight-bold">{formatAmount(this.currencySymbol, this.service.price)}</p>
              )}
              <div class="d-flex align-items-center">
                <wa-tooltip for={`edit-extra-service-${this.service.booking_system_id}`}>Edit service</wa-tooltip>
                <ir-custom-button
                  id={`edit-extra-service-${this.service.booking_system_id}`}
                  onClickHandler={e => {
                    e.stopImmediatePropagation();
                    e.stopPropagation();
                    this.editExtraService.emit(this.service);
                  }}
                  iconBtn
                  appearance={'plain'}
                  variant={'neutral'}
                >
                  <wa-icon name="edit" label="Edit" style={{ fontSize: '1rem' }}></wa-icon>
                </ir-custom-button>
                <wa-tooltip for={`delete-extra-service-${this.service.booking_system_id}`}>Delete service</wa-tooltip>
                <ir-custom-button
                  iconBtn
                  id={`delete-extra-service-${this.service.booking_system_id}`}
                  onClickHandler={e => {
                    e.stopImmediatePropagation();
                    e.stopPropagation();
                    this.irModalRef.openModal();
                  }}
                  appearance={'plain'}
                  variant={'danger'}
                >
                  <wa-icon name="trash-can" label="Edit" style={{ fontSize: '1rem' }}></wa-icon>
                </ir-custom-button>
              </div>
            </div>
          </div>
          <div class="extra-service-conditional-date">
            {this.service.start_date && this.service.end_date ? (
              <ir-date-view class="extra-service-date-view mr-1" from_date={this.service.start_date} to_date={this.service.end_date} showDateDifference={false}></ir-date-view>
            ) : (
              this.service.start_date && <p class="extra-service-date-view">{moment(new Date(this.service.start_date)).format('MMM DD, YYYY')}</p>
            )}
          </div>
        </div>
        <ir-dialog
          onIrDialogHide={e => {
            e.stopImmediatePropagation();
            e.stopPropagation();
          }}
          label="Alert"
          ref={el => (this.irModalRef = el)}
          lightDismiss={false}
        >
          {`${locales.entries['Lcz_AreYouSureDoYouWantToRemove ']} ${locales.entries.Lcz_ThisService} ${locales.entries.Lcz_FromThisBooking}`}
          <div slot="footer" class="ir-dialog__footer">
            <ir-custom-button appearance="filled" variant="neutral" size="medium" data-dialog="close">
              {locales.entries.Lcz_Cancel}
            </ir-custom-button>
            <ir-custom-button onClickHandler={() => this.deleteService()} loading={isRequestPending('/Do_Booking_Extra_Service')} variant="danger" size="medium">
              {locales.entries.Lcz_Delete}
            </ir-custom-button>
          </div>
        </ir-dialog>
      </Host>
    );
  }
}
