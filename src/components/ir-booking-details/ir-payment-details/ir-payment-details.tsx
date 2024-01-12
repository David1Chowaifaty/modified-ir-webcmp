import { Component, h, Prop, State, Event, EventEmitter, Watch } from '@stencil/core';
import { _formatAmount, _formatDate } from '../functions';
import { Booking, IDueDate, IPayment } from '@/models/booking.dto';
import { BookingService } from '@/services/booking.service';
import moment from 'moment';
import { PaymentService } from '@/services/payment.service';
import { Languages } from '@/components';

@Component({
  tag: 'ir-payment-details',
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

  @Event({ bubbles: true }) handlePaymentItemChange: EventEmitter<any>;
  @Event({ bubbles: true }) creditCardPressHandler: EventEmitter<any>;

  private itemToBeAdded: IPayment;
  private paymentService = new PaymentService();

  async componentWillLoad() {
    try {
      if (!this.bookingDetails.is_direct && this.bookingDetails.channel_booking_nbr) {
        this.paymentDetailsUrl = await new BookingService().getPCICardInfoURL(this.bookingDetails.booking_nbr);
      }
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
    // emit the item to be added
    // if (this.item.My_Payment == null) {
    //   this.item.My_Payment = [];
    // }
    // this.itemToBeAdded.id = this.item.My_Payment[this.item.My_Payment.length - 1]?.PAYMENT_ID + 1 || 1;
    // this.item.My_Payment = [...this.item.My_Payment, this.itemToBeAdded];
    // console.log(this.item);
    // this.handlePaymentItemChange.emit(this.item.My_Payment);
    console.log('item to be added :', this.itemToBeAdded);
    this.initializeItemToBeAdded();
    await this.paymentService.AddPayment(this.itemToBeAdded, this.bookingDetails.booking_nbr);
  }
  handlePaymentInputChange(key: keyof IPayment, value: any) {
    this.itemToBeAdded = { ...this.itemToBeAdded, [key]: value };
  }
  async handleConfirmModal(e: CustomEvent) {
    e.stopImmediatePropagation();
    e.stopPropagation();
    try {
      await this.paymentService.CancelPayment(this.toBeDeletedItem.id);
      const newPaymentArray = this.bookingDetails.financial.payments.filter((item: IPayment) => item.id !== this.toBeDeletedItem.id);
      this.bookingDetails = { ...this.bookingDetails, financial: { ...this.bookingDetails.financial, payments: newPaymentArray } };
      this.confirmModal = !this.confirmModal;
      //this.handlePaymentItemChange.emit(this.item.My_Payment);
      this.toBeDeletedItem = null;
    } catch (error) {
      console.log(error);
    }
  }

  @Watch('paymentDetailsUrl')
  wandler() {
    console.log('Changed');
    this.flag = !this.flag;
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
      <div class="row m-0">
        <div class="col-9 p-0">
          <div class="row m-0">
            <div class="col-4  border-right-light p-0 border-bottom-light border-2">
              {rowMode === 'normal' ? (
                <span class="sm-padding-left">{_formatDate(item.date)}</span>
              ) : (
                <ir-date-picker singleDatePicker autoApply onDateChanged={this.handleDateChange.bind(this)}></ir-date-picker>
              )}
            </div>
            <div class="col-4 border-right-light d-flex p-0 justify-content-end border-bottom-light border-2 sm-padding-right">
              {rowMode === 'normal' ? (
                <span class="sm-padding-right">${item.amount}</span>
              ) : (
                <input class="border-0 w-100" onInput={event => this.handlePaymentInputChange('amount', +(event.target as HTMLInputElement).value)} type="number"></input>
              )}
            </div>
            <div class="col-4 border-right-light p-0 border-bottom-light border-2 sm-padding-left">
              {rowMode === 'normal' ? (
                <span class="sm-padding-left">{item.designation}</span>
              ) : (
                <input class="border-0 w-100" onInput={event => this.handlePaymentInputChange('designation', (event.target as HTMLInputElement).value)} type="text"></input>
              )}
            </div>
            <div class="col-12 border-right-light p-0 border-bottom-light border-2 sm-padding-left">
              {rowMode === 'normal' ? (
                <span class="sm-padding-left">{item.reference}</span>
              ) : (
                <input
                  class="border-0 w-100"
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
            </div>
          </div>
        </div>
        <div class="col-3 d-flex align-items-center justify-content-between border-right-light border-bottom-light border-2">
          <ir-icon
            icon="ft-save color-ir-light-blue-hover h5 pointer"
            onClick={
              rowMode === 'add'
                ? () => {
                    this.newTableRow = false;
                    this._handleSave();
                  }
                : () => {}
            }
          ></ir-icon>

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
        </div>
      </div>
    );
  }

  bookingGuarantee() {
    if (!this.bookingDetails?.guest?.cci) {
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
            onClick={() => {
              if (!this.item.IS_DIRECT) {
                this.creditCardPressHandler.emit(this.item.BOOK_NBR);
              }
              this.collapsedGuarantee = !this.collapsedGuarantee;
            }}
          ></ir-icon>
        </div>
        <div class="collapse guarrantee">
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
      // <div class="fluid-container">
      //   <div class="row mb-1">
      //     <div class="col-xl-3 col-lg-4 col-md-2 col-sm-3 col-4 pr-0">{_formatDate(item.date)}</div>
      //     <div class="col-1 d-flex px-0 justify-content-end">{_formatAmount(item.amount, this.bookingDetails.currency.code)}</div>
      //     <div class="col-xl-3 col-lg-4 col-md-3 col-sm-3 col-4">{item.description}</div>

      //     <span class="ml-1 col-12 font-size-small collapse roomName">{item.room}</span>
      //   </div>
      // </div>
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
          <div class="mt-2">
            <strong>{this.defaultTexts.entries.Lcz_Payments}</strong>
            <div class="fluid-container border-top-light border-2 border-left-light font-size-small">
              <div class="row m-0">
                <div class="col-3 font-weight-bold border-right-light border-bottom-light border-2 p-0">
                  <span class="sm-padding-left">{this.defaultTexts.entries.Lcz_Dates}</span>
                </div>
                <div class="col-3 font-weight-bold border-right-light border-bottom-light border-2 p-0">
                  <span class="sm-padding-left">{this.defaultTexts.entries.Lcz_Amount}</span>
                </div>
                <div class="col-3 font-weight-bold border-right-light border-bottom-light border-2 p-0 sm-padding-left">
                  <span class="sm-padding-left">{this.defaultTexts.entries.Lcz_Designation}</span>
                </div>
                <div class="col-3 text-center border-right-light p-0 border-bottom-light border-2">
                  <ir-icon
                    id="add-payment"
                    icon="ft-plus font-weight-bold color-ir-light-blue-hover pointer p-0"
                    onClick={() => {
                      this.newTableRow = true;
                    }}
                  ></ir-icon>
                </div>
              </div>
              {this.bookingDetails.financial.payments?.map((item: any) => this._renderTableRow(item))}
              {this.newTableRow ? this._renderTableRow(null, 'add') : null}
            </div>
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
