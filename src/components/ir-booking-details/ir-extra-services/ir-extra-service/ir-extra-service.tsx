import { Component, Event, EventEmitter, Host, Prop, h } from '@stencil/core';
import { ExtraService } from '@/models/booking.dto';
import { formatAmount } from '@/utils/utils';
import { colorVariants } from '@/components/ui/ir-icons/icons';
import locales from '@/stores/locales.store';
import moment from 'moment';
import { BookingService } from '@/services/booking.service';
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
  @Event() resetBookingData: EventEmitter<null>;

  private irModalRef: HTMLIrModalElement;
  private bookingService = new BookingService();

  private async deleteService() {
    try {
      await this.bookingService.doBookingExtraService({
        service: this.service,
        is_remove: true,
        booking_nbr: this.bookingNumber,
      });
      this.resetBookingData.emit(null);
    } catch (error) {
      console.log(error);
    }
  }
  render() {
    return (
      <Host>
        <div class="p-1">
          <div class={'extra-service-container'}>
            <p class="extra-service-description">{this.service.description}</p>
            <div class="extra-service-actions">
              {this.service.price && <p class="extra-service-price p-0 m-0 font-weight-bold">{formatAmount(this.currencySymbol, this.service.price)}</p>}
              <ir-button
                id={`serviceEdit-${this.service.booking_system_id}`}
                class="extra-service-edit-btn m-0 p-0"
                variant="icon"
                icon_name="edit"
                style={colorVariants.secondary}
                onClickHandler={() => this.editExtraService.emit(this.service)}
              ></ir-button>
              <ir-button
                class="extra-service-delete-btn m-0 p-0"
                variant="icon"
                onClickHandler={() => this.irModalRef.openModal()}
                id={`roomDelete-${this.service.booking_system_id}`}
                icon_name="trash"
                style={colorVariants.danger}
              ></ir-button>
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
        <ir-modal
          autoClose={false}
          ref={el => (this.irModalRef = el)}
          isLoading={isRequestPending('/Do_Booking_Extra_Service')}
          onConfirmModal={this.deleteService.bind(this)}
          iconAvailable={true}
          icon="ft-alert-triangle danger h1"
          leftBtnText={locales.entries.Lcz_Cancel}
          rightBtnText={locales.entries.Lcz_Delete}
          leftBtnColor="secondary"
          rightBtnColor="danger"
          modalTitle={locales.entries.Lcz_Confirmation}
          modalBody={`${locales.entries['Lcz_AreYouSureDoYouWantToRemove ']} ${locales.entries.Lcz_ThisService} ${locales.entries.Lcz_FromThisBooking}`}
        ></ir-modal>
      </Host>
    );
  }
}
