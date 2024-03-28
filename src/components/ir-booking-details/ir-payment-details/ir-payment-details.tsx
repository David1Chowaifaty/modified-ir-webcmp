import { Component, h, Prop, State, Event, EventEmitter, Fragment, Watch } from '@stencil/core';
import { _formatAmount, _formatDate } from '../functions';
import { Booking, IDueDate, IPayment } from '@/models/booking.dto';
import { BookingService } from '@/services/booking.service';
import moment from 'moment';
import { PaymentService } from '@/services/payment.service';
import { ILocale, IToast } from '@/components';
import calendar_data from '@/stores/calendar-data';

@Component({
  styleUrl: 'ir-payment-details.css',
  tag: 'ir-payment-details',
  scoped: true,
})
export class IrPaymentDetails {
  @Prop({ mutable: true }) bookingDetails: Booking;
  @Prop() defaultTexts: ILocale;
  @State() newTableRow: boolean = false;

  @State() collapsedPayment: boolean = false;
  @State() collapsedGuarantee: boolean = false;

  @State() flag: boolean = false;

  @State() confirmModal: boolean = false;
  @State() toBeDeletedItem: IPayment;

  @State() paymentDetailsUrl: string = '';
  @State() paymentExceptionMessage: string = '';

  @Event({ bubbles: true }) resetBookingData: EventEmitter<null>;
  @Event({ bubbles: true }) toast: EventEmitter<IToast>;
  private itemToBeAdded: IPayment;
  private paymentService = new PaymentService();
  private bookingService = new BookingService();

  async componentWillLoad() {
    try {
      this.paymentService.setToken(calendar_data.token);
      this.bookingService.setToken(calendar_data.token);
      this.initializeItemToBeAdded();
    } catch (error) {
      if (!this.bookingDetails.is_direct && this.bookingDetails.channel_booking_nbr) {
        this.paymentExceptionMessage = error;
      }
    }
  }
  initializeItemToBeAdded() {
    this.itemToBeAdded = {
      id: -1,
      date: moment().format('YYYY-MM-DD'),
      amount: null,
      currency: this.bookingDetails.currency,
      designation: '',
      reference: '',
    };
  }

  async _handleSave() {
    try {
      console.log(this.itemToBeAdded);
      if (this.itemToBeAdded.amount === null) {
        this.toast.emit({
          type: 'error',
          title: this.defaultTexts.entries.Lcz_EnterAmount,
          description: '',
          position: 'top-right',
        });
        return;
      }
      await this.paymentService.AddPayment(this.itemToBeAdded, this.bookingDetails.booking_nbr);
      this.initializeItemToBeAdded();
      this.resetBookingData.emit(null);
    } catch (error) {
      console.log(error);
    }
  }
  handlePaymentInputChange(key: keyof IPayment, value: any, event?: InputEvent) {
    if (key === 'amount') {
      if (!isNaN(value) || value === '') {
        if (value === '') {
          this.itemToBeAdded = { ...this.itemToBeAdded, [key]: null };
        } else {
          this.itemToBeAdded = { ...this.itemToBeAdded, [key]: parseFloat(value) };
        }
      } else if (event && event.target) {
        let inputElement = event.target as HTMLInputElement;
        let inputValue = inputElement.value;
        inputValue = inputValue.replace(/[^\d-]|(?<!^)-/g, '');
        inputElement.value = inputValue;
      }
    } else {
      this.itemToBeAdded = { ...this.itemToBeAdded, [key]: value };
    }
  }
  async handleConfirmModal(e: CustomEvent) {
    e.stopImmediatePropagation();
    e.stopPropagation();
    try {
      await this.paymentService.CancelPayment(this.toBeDeletedItem.id);
      const newPaymentArray = this.bookingDetails.financial.payments.filter((item: IPayment) => item.id !== this.toBeDeletedItem.id);
      this.bookingDetails = { ...this.bookingDetails, financial: { ...this.bookingDetails.financial, payments: newPaymentArray } };
      this.confirmModal = !this.confirmModal;
      this.resetBookingData.emit(null);
      this.toBeDeletedItem = null;
    } catch (error) {
      console.log(error);
    }
  }
  @Watch('bookingDetails')
  handleBookingDetails() {
    if (this.newTableRow) {
      this.newTableRow = false;
    }
  }
  handleDateChange(
    e: CustomEvent<{
      start: moment.Moment;
      end: moment.Moment;
    }>,
  ) {
    this.handlePaymentInputChange('date', e.detail.end.format('YYYY-MM-DD'));
  }
  _renderTableRow(item: IPayment, rowMode: 'add' | 'normal' = 'normal') {
    return (
      <Fragment>
        <tr>
          <td class={'border payments-height border-light border-bottom-0 text-center'}>
            {rowMode === 'normal' ? (
              <span class="sm-padding-left">{_formatDate(item.date)}</span>
            ) : (
              <ir-date-picker
                minDate={moment().add(-2, 'months').startOf('month').format('YYYY-MM-DD')}
                singleDatePicker
                autoApply
                onDateChanged={this.handleDateChange.bind(this)}
              ></ir-date-picker>
            )}
          </td>
          <td class={'border payments-height border-light border-bottom-0 text-center '}>
            {rowMode === 'normal' ? (
              <span class="sm-padding-right">${Number(item.amount).toFixed(2)}</span>
            ) : (
              <input
                type="text"
                class="border-0  form-control py-0 m-0 w-100"
                value={this.itemToBeAdded.amount === null ? '' : Number(this.itemToBeAdded.amount).toFixed(2)}
                onInput={event => this.handlePaymentInputChange('amount', +(event.target as HTMLInputElement).value, event)}
              ></input>
            )}
          </td>
          <td class={'border payments-height border-light border-bottom-0 text-center'}>
            {rowMode === 'normal' ? (
              <span class="sm-padding-left">{item.designation}</span>
            ) : (
              <input
                class="border-0 w-100 form-control py-0 m-0"
                onInput={event => this.handlePaymentInputChange('designation', (event.target as HTMLInputElement).value)}
                type="text"
              ></input>
            )}
          </td>
          <td rowSpan={2} class={'border payments-height border-light border-bottom-0 text-center'}>
            <ir-icon
              icon="ft-save color-ir-light-blue-hover h5 pointer sm-margin-right"
              onClick={
                rowMode === 'add'
                  ? () => {
                      this._handleSave();
                    }
                  : () => {}
              }
            >
              <svg slot="icon" xmlns="http://www.w3.org/2000/svg" height="16" width="14.25" viewBox="0 0 448 512">
                <path
                  fill="#6b6f82"
                  d="M64 32C28.7 32 0 60.7 0 96V416c0 35.3 28.7 64 64 64H384c35.3 0 64-28.7 64-64V173.3c0-17-6.7-33.3-18.7-45.3L352 50.7C340 38.7 323.7 32 306.7 32H64zm0 96c0-17.7 14.3-32 32-32H288c17.7 0 32 14.3 32 32v64c0 17.7-14.3 32-32 32H96c-17.7 0-32-14.3-32-32V128zM224 288a64 64 0 1 1 0 128 64 64 0 1 1 0-128z"
                />
              </svg>
            </ir-icon>
            <span> &nbsp;</span>
            <ir-icon
              icon="ft-trash-2 danger h5 pointer"
              onClick={
                rowMode === 'add'
                  ? () => {
                      this.newTableRow = false;
                      this.initializeItemToBeAdded();
                    }
                  : () => {
                      this.toBeDeletedItem = item;
                      const modal: any = document.querySelector('.delete-record-modal');
                      modal.openModal();
                    }
              }
            >
              <svg slot="icon" fill="#ff2441" xmlns="http://www.w3.org/2000/svg" height="16" width="14.25" viewBox="0 0 448 512">
                <path d="M135.2 17.7C140.6 6.8 151.7 0 163.8 0H284.2c12.1 0 23.2 6.8 28.6 17.7L320 32h96c17.7 0 32 14.3 32 32s-14.3 32-32 32H32C14.3 96 0 81.7 0 64S14.3 32 32 32h96l7.2-14.3zM32 128H416V448c0 35.3-28.7 64-64 64H96c-35.3 0-64-28.7-64-64V128zm96 64c-8.8 0-16 7.2-16 16V432c0 8.8 7.2 16 16 16s16-7.2 16-16V208c0-8.8-7.2-16-16-16zm96 0c-8.8 0-16 7.2-16 16V432c0 8.8 7.2 16 16 16s16-7.2 16-16V208c0-8.8-7.2-16-16-16zm96 0c-8.8 0-16 7.2-16 16V432c0 8.8 7.2 16 16 16s16-7.2 16-16V208c0-8.8-7.2-16-16-16z" />
              </svg>
            </ir-icon>
          </td>
        </tr>
        <tr>
          <td colSpan={3} class={'border border-light payments-height border-bottom-0 text-center'}>
            {rowMode === 'normal' ? (
              <span class="sm-padding-left ">{item.reference}</span>
            ) : (
              <input
                class="border-0 w-100  form-control py-0 m-0"
                onKeyPress={event => {
                  if (event.key === 'Enter') {
                    this.newTableRow = false;
                    this._handleSave();
                  }
                }}
                onInput={event => this.handlePaymentInputChange('reference', (event.target as HTMLInputElement).value)}
                type="text"
              ></input>
            )}
          </td>
        </tr>
      </Fragment>
    );
  }

  bookingGuarantee() {
    if (this.bookingDetails.is_direct && !this.bookingDetails.guest.cci) {
      return null;
    }
    return (
      <div>
        <div class="d-flex align-items-center">
          <strong class="mr-1">{this.defaultTexts.entries.Lcz_BookingGuarantee}</strong>
          <ir-icon
            id="drawer-icon"
            data-toggle="collapse"
            data-target={`.guarrantee`}
            aria-expanded="false"
            aria-controls="myCollapse"
            class="sm-padding-right pointer"
            onClick={async () => {
              if (!this.bookingDetails.is_direct && this.bookingDetails.channel_booking_nbr) {
                this.paymentDetailsUrl = await this.bookingService.getPCICardInfoURL(this.bookingDetails.booking_nbr);
              }
              this.collapsedGuarantee = !this.collapsedGuarantee;
            }}
          >
            <svg slot="icon" xmlns="http://www.w3.org/2000/svg" height="20" width="22.5" viewBox="0 0 576 512">
              <path
                fill="#104064"
                d="M512 80c8.8 0 16 7.2 16 16v32H48V96c0-8.8 7.2-16 16-16H512zm16 144V416c0 8.8-7.2 16-16 16H64c-8.8 0-16-7.2-16-16V224H528zM64 32C28.7 32 0 60.7 0 96V416c0 35.3 28.7 64 64 64H512c35.3 0 64-28.7 64-64V96c0-35.3-28.7-64-64-64H64zm56 304c-13.3 0-24 10.7-24 24s10.7 24 24 24h48c13.3 0 24-10.7 24-24s-10.7-24-24-24H120zm128 0c-13.3 0-24 10.7-24 24s10.7 24 24 24H360c13.3 0 24-10.7 24-24s-10.7-24-24-24H248z"
              />
            </svg>
          </ir-icon>
        </div>
        <div class="collapse guarrantee ">
          {this.bookingDetails.is_direct ? (
            [
              <div>
                {this.bookingDetails?.guest?.cci && 'Card:'} <span>{this.bookingDetails?.guest?.cci?.nbr || ''}</span> {this.bookingDetails?.guest?.cci?.expiry_month && 'Expiry: '}
                <span>
                  {' '}
                  {this.bookingDetails?.guest?.cci?.expiry_month || ''} {this.bookingDetails?.guest?.cci?.expiry_year && '/' + this.bookingDetails?.guest?.cci?.expiry_year}
                </span>
              </div>,
              <div>
                {this.bookingDetails?.guest?.cci.holder_name && 'Name:'} <span>{this.bookingDetails?.guest?.cci?.holder_name || ''}</span>{' '}
                {this.bookingDetails?.guest?.cci?.cvc && '- CVC:'} <span> {this.bookingDetails?.guest?.cci?.cvc || ''}</span>
              </div>,
            ]
          ) : this.paymentDetailsUrl ? (
            <iframe src={this.paymentDetailsUrl} width="100%" class="iframeHeight" frameborder="0" name="payment"></iframe>
          ) : (
            <div class="text-center">{this.paymentExceptionMessage}</div>
          )}
        </div>
      </div>
    );
  }

  _renderDueDate(item: IDueDate) {
    return (
      <tr>
        <td class={'pr-1'}>{_formatDate(item.date)}</td>
        <td class={'pr-1'}>{_formatAmount(item.amount, this.bookingDetails.currency.code)}</td>
        <td class={'pr-1'}>{item.description}</td>
        <td class="collapse font-size-small roomName">{item.room}</td>
      </tr>
    );
  }

  render() {
    if (!this.bookingDetails.financial) {
      return null;
    }

    return [
      <div class="card m-0">
        <div class="p-1">
          {this.bookingDetails.financial.gross_cost > 0 && this.bookingDetails.financial.gross_cost !== null && (
            <div class="mb-2 h4 total-cost-container">
              {this.defaultTexts.entries.Lcz_TotalCost}: <span>{_formatAmount(this.bookingDetails.financial.gross_cost, this.bookingDetails.currency.code)}</span>
            </div>
          )}
          <div class="mb-2 h4">
            {this.defaultTexts.entries.Lcz_DueBalance}:{' '}
            <span class="danger font-weight-bold">{_formatAmount(this.bookingDetails.financial.due_amount, this.bookingDetails.currency.code)}</span>
          </div>
          {this.bookingGuarantee()}
          <div class="mt-2">
            <div>
              {this.bookingDetails.financial?.due_dates?.length > 0 && (
                <Fragment>
                  <div class="d-flex align-items-center">
                    <strong class="mr-1">{this.defaultTexts.entries.Lcz_PaymentDueDates}</strong>
                    <ir-icon
                      id="drawer-icon"
                      data-toggle="collapse"
                      data-target={`.roomName`}
                      aria-expanded="false"
                      aria-controls="myCollapse"
                      class="sm-padding-right pointer"
                      onClick={() => {
                        this.collapsedPayment = !this.collapsedPayment;
                      }}
                    >
                      {!this.collapsedPayment ? (
                        <svg slot="icon" xmlns="http://www.w3.org/2000/svg" height="20" width="22.5" viewBox="0 0 576 512">
                          <path
                            fill="#104064"
                            d="M288 32c-80.8 0-145.5 36.8-192.6 80.6C48.6 156 17.3 208 2.5 243.7c-3.3 7.9-3.3 16.7 0 24.6C17.3 304 48.6 356 95.4 399.4C142.5 443.2 207.2 480 288 480s145.5-36.8 192.6-80.6c46.8-43.5 78.1-95.4 93-131.1c3.3-7.9 3.3-16.7 0-24.6c-14.9-35.7-46.2-87.7-93-131.1C433.5 68.8 368.8 32 288 32zM144 256a144 144 0 1 1 288 0 144 144 0 1 1 -288 0zm144-64c0 35.3-28.7 64-64 64c-7.1 0-13.9-1.2-20.3-3.3c-5.5-1.8-11.9 1.6-11.7 7.4c.3 6.9 1.3 13.8 3.2 20.7c13.7 51.2 66.4 81.6 117.6 67.9s81.6-66.4 67.9-117.6c-11.1-41.5-47.8-69.4-88.6-71.1c-5.8-.2-9.2 6.1-7.4 11.7c2.1 6.4 3.3 13.2 3.3 20.3z"
                          />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" height="20" width="25" viewBox="0 0 640 512" slot="icon">
                          <path
                            fill="#104064"
                            d="M38.8 5.1C28.4-3.1 13.3-1.2 5.1 9.2S-1.2 34.7 9.2 42.9l592 464c10.4 8.2 25.5 6.3 33.7-4.1s6.3-25.5-4.1-33.7L525.6 386.7c39.6-40.6 66.4-86.1 79.9-118.4c3.3-7.9 3.3-16.7 0-24.6c-14.9-35.7-46.2-87.7-93-131.1C465.5 68.8 400.8 32 320 32c-68.2 0-125 26.3-169.3 60.8L38.8 5.1zM223.1 149.5C248.6 126.2 282.7 112 320 112c79.5 0 144 64.5 144 144c0 24.9-6.3 48.3-17.4 68.7L408 294.5c8.4-19.3 10.6-41.4 4.8-63.3c-11.1-41.5-47.8-69.4-88.6-71.1c-5.8-.2-9.2 6.1-7.4 11.7c2.1 6.4 3.3 13.2 3.3 20.3c0 10.2-2.4 19.8-6.6 28.3l-90.3-70.8zM373 389.9c-16.4 6.5-34.3 10.1-53 10.1c-79.5 0-144-64.5-144-144c0-6.9 .5-13.6 1.4-20.2L83.1 161.5C60.3 191.2 44 220.8 34.5 243.7c-3.3 7.9-3.3 16.7 0 24.6c14.9 35.7 46.2 87.7 93 131.1C174.5 443.2 239.2 480 320 480c47.8 0 89.9-12.9 126.2-32.5L373 389.9z"
                          />
                        </svg>
                      )}
                    </ir-icon>
                  </div>

                  <table>{this.bookingDetails.financial.due_dates?.map(item => this._renderDueDate(item))}</table>
                </Fragment>
              )}
            </div>
          </div>
          <div class="mt-2 d-flex  flex-column rounded payment-container">
            <strong>{this.defaultTexts.entries.Lcz_Payments}</strong>
            <table class="mt-1">
              <thead>
                <tr>
                  <th class={'border border-light border-bottom-0 text-center payment_date'}>{this.defaultTexts.entries.Lcz_Dates}</th>
                  <th class={'border border-light border-bottom-0 text-center w-60'}>{this.defaultTexts.entries.Lcz_Amount}</th>
                  <th class={'border border-light border-bottom-0 text-center designation'}>{this.defaultTexts.entries.Lcz_Designation}</th>
                  <th class={'border border-light border-bottom-0 text-center action_icons'}>
                    <span class={'sr-only'}>payment actions</span>
                    <ir-icon
                      id="add-payment"
                      icon="font-weight-bold p-0"
                      onClick={() => {
                        this.newTableRow = true;
                      }}
                    >
                      <svg height={14} width={14} slot="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
                        <path d="M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32V224H48c-17.7 0-32 14.3-32 32s14.3 32 32 32H192V432c0 17.7 14.3 32 32 32s32-14.3 32-32V288H400c17.7 0 32-14.3 32-32s-14.3-32-32-32H256V80z" />
                      </svg>
                    </ir-icon>
                  </th>
                </tr>
              </thead>
              <tbody>
                {this.bookingDetails.financial.payments?.map((item: any) => this._renderTableRow(item))}
                {this.newTableRow ? this._renderTableRow(null, 'add') : null}
              </tbody>
            </table>
          </div>
        </div>
      </div>,
      <ir-modal
        item={this.toBeDeletedItem}
        class={'delete-record-modal'}
        modalTitle={this.defaultTexts.entries.Lcz_Confirmation}
        modalBody="If deleted it will be permnantly lost!"
        iconAvailable={true}
        icon="ft-alert-triangle danger h1"
        leftBtnText={this.defaultTexts.entries.Lcz_Cancel}
        rightBtnText={this.defaultTexts.entries.Lcz_Delete}
        leftBtnColor="secondary"
        rightBtnColor="danger"
        onConfirmModal={this.handleConfirmModal.bind(this)}
      ></ir-modal>,
    ];
  }
}
