import { Component, h, Prop, State, Event, EventEmitter, Fragment } from '@stencil/core';
import { _formatAmount, _formatDate } from '../functions';
import { Booking, IDueDate, IPayment } from '@/models/booking.dto';
import { BookingService } from '@/services/booking.service';
import moment from 'moment';
import { PaymentService } from '@/services/payment.service';
import { Languages } from '@/components';

@Component({
  styleUrl: 'ir-payment-details.css',
  tag: 'ir-payment-details',
  scoped: true,
})
export class IrPaymentDetails {
  @Prop({ mutable: true, reflect: true }) item: any;
  @Prop({ mutable: true }) bookingDetails: Booking;
  @Prop() defaultTexts: Languages;
  @State() newTableRow: boolean = false;

  @State() collapsedPayment: boolean = false;
  @State() collapsedGuarantee: boolean = false;

  @State() flag: boolean = false;

  @State() confirmModal: boolean = false;
  @State() toBeDeletedItem: IPayment;

  @State() paymentDetailsUrl: string = '';
  @Prop() paymentExceptionMessage: string = '';

  @Event({ bubbles: true }) resetBookingData: EventEmitter<null>;
  @Event({ bubbles: true }) creditCardPressHandler: EventEmitter<any>;

  private itemToBeAdded: IPayment;
  private paymentService = new PaymentService();

  async componentWillLoad() {
    try {
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
      amount: 0,
      currency: this.bookingDetails.currency,
      designation: '',
      reference: '',
    };
  }

  async _handleSave() {
    try {
      await this.paymentService.AddPayment(this.itemToBeAdded, this.bookingDetails.booking_nbr);
      this.initializeItemToBeAdded();
      this.resetBookingData.emit(null);
    } catch (error) {
      console.log(error);
    }
  }
  handlePaymentInputChange(key: keyof IPayment, value: any, event?: InputEvent) {
    if (key === 'amount') {
      if (!isNaN(value)) {
        this.itemToBeAdded = { ...this.itemToBeAdded, [key]: value };
      } else {
        let inputElement = event.target as HTMLInputElement;
        let inputValue = inputElement.value;
        inputValue = inputValue.replace(/[^0-9]/g, '');
        inputElement.value = inputValue;
        if (inputValue === '') {
          this.itemToBeAdded = { ...this.itemToBeAdded, [key]: 0 };
        }
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
      //this.handlePaymentItemChange.emit(this.item.My_Payment);
      this.toBeDeletedItem = null;
    } catch (error) {
      console.log(error);
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
          <td class={'border border-light border-bottom-0 text-center'}>
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
          <td class={'border border-light border-bottom-0 text-center '}>
            {rowMode === 'normal' ? (
              <span class="sm-padding-right">${Number(item.amount).toFixed(2)}</span>
            ) : (
              <input
                class="border-0  form-control py-0 m-0 w-100"
                value={this.itemToBeAdded.amount === 0 ? '' : Number(this.itemToBeAdded.amount).toFixed(2)}
                onInput={event => this.handlePaymentInputChange('amount', +(event.target as HTMLInputElement).value, event)}
                type="text"
              ></input>
            )}
          </td>
          <td class={'border border-light border-bottom-0 text-center'}>
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
          <td rowSpan={2} class={'border border-light border-bottom-0 text-center'}>
            <ir-icon
              icon="ft-save color-ir-light-blue-hover h5 pointer sm-margin-right"
              onClick={
                rowMode === 'add'
                  ? () => {
                      this.newTableRow = false;
                      this._handleSave();
                    }
                  : () => {}
              }
            ></ir-icon>
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
            ></ir-icon>
          </td>
        </tr>
        <tr>
          <td colSpan={3} class={'border border-light border-bottom-0 text-center'}>
            {rowMode === 'normal' ? (
              <span class="sm-padding-left">{item.reference}</span>
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
            icon={`${this.collapsedGuarantee ? 'ft-credit-card' : 'ft-credit-card'} h2 color-ir-light-blue-hover`}
            data-toggle="collapse"
            data-target={`.guarrantee`}
            aria-expanded="false"
            aria-controls="myCollapse"
            class="sm-padding-right pointer"
            onClick={async () => {
              if (!this.bookingDetails.is_direct && this.bookingDetails.channel_booking_nbr) {
                this.paymentDetailsUrl = await new BookingService().getPCICardInfoURL(this.bookingDetails.booking_nbr);
              }
              this.collapsedGuarantee = !this.collapsedGuarantee;
            }}
          ></ir-icon>
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
      <div class="card">
        <div class="p-1">
          <div class="mb-2 h4">
            {this.defaultTexts.entries.Lcz_DueBalance}:{' '}
            <span class="danger font-weight-bold">{_formatAmount(this.bookingDetails.financial.due_amount, this.bookingDetails.currency.code)}</span>
          </div>

          {this.bookingGuarantee()}
          <div class="mt-2">
            <div>
              <div class="d-flex align-items-center">
                <strong class="mr-1">{this.defaultTexts.entries.Lcz_PaymentDueDates}</strong>
                <ir-icon
                  id="drawer-icon"
                  icon={`${this.collapsedPayment ? 'ft-eye-off' : 'ft-eye'} h2 color-ir-light-blue-hover`}
                  data-toggle="collapse"
                  data-target={`.roomName`}
                  aria-expanded="false"
                  aria-controls="myCollapse"
                  class="sm-padding-right pointer"
                  onClick={() => {
                    this.collapsedPayment = !this.collapsedPayment;
                  }}
                ></ir-icon>
              </div>
              <table>{this.bookingDetails.financial.due_dates?.map(item => this._renderDueDate(item))}</table>
            </div>
          </div>
          <div class="mt-2 d-flex  flex-column rounded">
            <strong>{this.defaultTexts.entries.Lcz_Payments}</strong>
            <table class="mt-1">
              <thead>
                <tr>
                  <th class={'border border-light border-bottom-0 text-center payment_date'}>{this.defaultTexts.entries.Lcz_Dates}</th>
                  <th class={'border border-light border-bottom-0 text-center w-60'}>{this.defaultTexts.entries.Lcz_Amount}</th>
                  <th class={'border border-light border-bottom-0 text-center'}>{this.defaultTexts.entries.Lcz_Designation}</th>
                  <th class={'border border-light border-bottom-0 text-center action_icons'}>
                    <span class={'sr-only'}>payment actions</span>
                    <ir-icon
                      id="add-payment"
                      icon="ft-plus font-weight-bold color-ir-light-blue-hover pointer p-0"
                      onClick={() => {
                        this.newTableRow = true;
                      }}
                    ></ir-icon>
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
