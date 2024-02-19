import { Component, h, Prop, EventEmitter, Event, Listen, State, Element, Watch, Host, Fragment } from '@stencil/core';
import { _formatAmount, _formatDate, _getDay } from '../functions';
import { Booking, IUnit, Room } from '../../../models/booking.dto';
import { TIglBookPropertyPayload } from '../../../models/igl-book-property';
import { formatName } from '../../../utils/booking';
import { IrModal } from '@/components/ir-modal/ir-modal';
import axios from 'axios';
import { ILocale } from '@/stores/locales.store';
import calendar_data from '@/stores/calendar-data';

@Component({
  tag: 'ir-room',
  styleUrl: 'ir-room.css',
  scoped: true,
})
export class IrRoom {
  // Room Data
  @Prop() bookingEvent: Booking;
  @Prop() bookingIndex: number;
  // Meal Code names
  @Prop() mealCodeName: string;
  @Prop() myRoomTypeFoodCat: string;
  // Currency
  @Prop() currency: string = 'USD';
  @Prop() legendData;
  @Prop() roomsInfo;
  @State() collapsed: boolean = false;
  @Prop() defaultTexts: ILocale;
  @Prop() ticket;

  // Booleans Conditions
  @Prop() hasRoomEdit: boolean = false;
  @Prop() hasRoomDelete: boolean = false;
  @Prop() hasRoomAdd: boolean = false;
  @Prop() hasCheckIn: boolean = false;
  @Prop() hasCheckOut: boolean = false;
  @Element() element: any;
  // Event Emitters
  @Event({ bubbles: true, composed: true }) deleteFinished: EventEmitter<string>;
  @Event({ bubbles: true, composed: true }) pressCheckIn: EventEmitter;
  @Event({ bubbles: true, composed: true }) pressCheckOut: EventEmitter;
  @Event({ bubbles: true, composed: true }) editInitiated: EventEmitter<TIglBookPropertyPayload>;
  @State() item: Room;
  @State() isLoading: boolean = false;
  @State() isModelOpen: boolean = false;
  private modal: IrModal;
  componentWillLoad() {
    if (this.bookingEvent) {
      this.item = this.bookingEvent.rooms[this.bookingIndex];
    }
  }
  @Watch('bookingEvent')
  handleBookingEventChange() {
    this.item = this.bookingEvent.rooms[this.bookingIndex];
  }
  componentDidLoad() {
    this.modal = this.element.querySelector('ir-modal');
  }
  @Listen('clickHanlder')
  handleClick(e) {
    let target = e.target;
    if (target.id == 'checkin') {
      this.pressCheckIn.emit(this.item);
    } else if (target.id == 'checkout') {
      this.pressCheckOut.emit(this.item);
    }
  }

  getDateStr(date, locale = 'default') {
    return date.getDate() + ' ' + date.toLocaleString(locale, { month: 'short' }) + ' ' + date.getFullYear();
  }
  handleEditClick() {
    this.editInitiated.emit({
      event_type: 'EDIT_BOOKING',
      ID: this.item['assigned_units_pool'],
      NAME: formatName(this.item.guest.first_name, this.item.guest.last_name),
      EMAIL: this.bookingEvent.guest.email,
      PHONE: this.bookingEvent.guest.mobile,
      REFERENCE_TYPE: '',
      FROM_DATE: this.bookingEvent.from_date,
      TO_DATE: this.bookingEvent.to_date,
      TITLE: `${this.defaultTexts.entries.Lcz_EditBookingFor} ${this.item?.roomtype?.name} ${(this.item?.unit as IUnit)?.name || ''}`,
      defaultDateRange: {
        dateDifference: this.item.days.length,
        fromDate: new Date(this.item.from_date + 'T00:00:00'),
        fromDateStr: this.getDateStr(new Date(this.item.from_date + 'T00:00:00')),
        toDate: new Date(this.item.to_date + 'T00:00:00'),
        toDateStr: this.getDateStr(new Date(this.item.to_date + 'T00:00:00')),
        message: '',
      },
      bed_preference: this.item.bed_preference,
      adult_child_offering: this.item.rateplan.selected_variation.adult_child_offering,
      ADULTS_COUNT: this.item.rateplan.selected_variation.adult_nbr,
      ARRIVAL: this.bookingEvent.arrival,
      ARRIVAL_TIME: this.bookingEvent.arrival.description,
      BOOKING_NUMBER: this.bookingEvent.booking_nbr,
      cancelation: this.item.rateplan.cancelation,
      channel_booking_nbr: this.bookingEvent.channel_booking_nbr,
      CHILDREN_COUNT: this.item.rateplan.selected_variation.child_nbr,
      COUNTRY: this.bookingEvent.guest.country_id,
      ENTRY_DATE: this.bookingEvent.from_date,
      FROM_DATE_STR: this.bookingEvent.format.from_date,
      guarantee: this.item.rateplan.guarantee,
      GUEST: this.bookingEvent.guest,
      IDENTIFIER: this.item.identifier,
      is_direct: this.bookingEvent.is_direct,
      IS_EDITABLE: this.bookingEvent.is_editable,
      NO_OF_DAYS: this.item.days.length,
      NOTES: this.bookingEvent.remark,
      origin: this.bookingEvent.origin,
      POOL: this.item['assigned_units_pool'],
      PR_ID: (this.item.unit as IUnit)?.id,
      RATE: this.item.total,
      RATE_PLAN: this.item.rateplan.name,
      RATE_PLAN_ID: this.item.rateplan.id,
      RATE_TYPE: this.item.roomtype.id,
      ROOMS: this.bookingEvent.rooms,
      SOURCE: this.bookingEvent.source,
      SPLIT_BOOKING: false,
      STATUS: 'IN-HOUSE',
      TO_DATE_STR: this.bookingEvent.format.to_date,
      TOTAL_PRICE: this.bookingEvent.total,
      legendData: this.legendData,
      roomsInfo: this.roomsInfo,
      roomName: (this.item.unit as IUnit)?.name || '',
    });
  }
  handleDeleteClick() {
    this.modal.openModal();
  }
  async deleteRoom() {
    try {
      this.isLoading = true;
      let oldRooms = [...this.bookingEvent.rooms];
      oldRooms = oldRooms.filter(room => room.identifier !== this.item.identifier);

      const body = {
        assign_units: true,
        check_in: true,
        is_pms: true,
        is_direct: true,
        booking: {
          booking_nbr: this.bookingEvent.booking_nbr,
          from_date: this.bookingEvent.from_date,
          to_date: this.bookingEvent.to_date,
          remark: this.bookingEvent.remark,
          property: this.bookingEvent.property,
          source: this.bookingEvent.source,
          currency: this.bookingEvent.currency,
          arrival: this.bookingEvent.arrival,
          guest: this.bookingEvent.guest,
          rooms: oldRooms,
        },
      };
      console.log('body:', body);

      const { data } = await axios.post(`/DoReservation?Ticket=${this.ticket}`, body);
      if (data.ExceptionMsg !== '') {
        throw new Error(data.ExceptionMsg);
      }
      this.deleteFinished.emit(this.item.identifier);
    } catch (error) {
    } finally {
      this.isLoading = false;
    }
  }
  render() {
    return (
      <Host class="p-1 d-flex m-0">
        <ir-icon
          id="drawer-icon"
          data-toggle="collapse"
          data-target={`#roomCollapse-${this.item.identifier.split(' ').join('')}`}
          aria-expanded="false"
          aria-controls="collapseExample"
          class="pointer mr-1"
          onClick={() => {
            this.collapsed = !this.collapsed;
          }}
        >
          {!this.collapsed ? (
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
        <div class="pl-1 flex-fill m-0 ">
          <div class="d-flex align-items-start justify-content-between">
            <p class="m-0 p-0">
              <strong class="m-0 p-0">{this.myRoomTypeFoodCat || ''} </strong> {this.mealCodeName}{' '}
              {this.item.rateplan.is_non_refundable && ` - ${this.defaultTexts.entries.Lcz_NonRefundable}`}{' '}
            </p>
            {/*this.item.My_Room_type.My_Room_type_desc[0].CUSTOM_TXT || ''*/}
            <div class="d-flex m-0 p-0 align-items-center">
              <span class="p-0 m-0 ml-1 font-weight-bold">{_formatAmount(this.item['gross_total'], this.currency)}</span>
              {this.hasRoomEdit && (
                <ir-icon id={`roomEdit-${this.item.identifier}`} class="pointer mx-1" onClick={this.handleEditClick.bind(this)}>
                  <svg slot="icon" xmlns="http://www.w3.org/2000/svg" height="16" width="16" viewBox="0 0 512 512">
                    <path
                      fill="#6b6f82"
                      d="M471.6 21.7c-21.9-21.9-57.3-21.9-79.2 0L362.3 51.7l97.9 97.9 30.1-30.1c21.9-21.9 21.9-57.3 0-79.2L471.6 21.7zm-299.2 220c-6.1 6.1-10.8 13.6-13.5 21.9l-29.6 88.8c-2.9 8.6-.6 18.1 5.8 24.6s15.9 8.7 24.6 5.8l88.8-29.6c8.2-2.7 15.7-7.4 21.9-13.5L437.7 172.3 339.7 74.3 172.4 241.7zM96 64C43 64 0 107 0 160V416c0 53 43 96 96 96H352c53 0 96-43 96-96V320c0-17.7-14.3-32-32-32s-32 14.3-32 32v96c0 17.7-14.3 32-32 32H96c-17.7 0-32-14.3-32-32V160c0-17.7 14.3-32 32-32h96c17.7 0 32-14.3 32-32s-14.3-32-32-32H96z"
                    />
                  </svg>
                </ir-icon>
              )}
              {this.hasRoomDelete && (
                <ir-icon onClick={this.handleDeleteClick.bind(this)} id={`roomDelete-${this.item.identifier}`} class="pointer">
                  <svg slot="icon" fill="#ff2441" xmlns="http://www.w3.org/2000/svg" height="16" width="14.25" viewBox="0 0 448 512">
                    <path d="M135.2 17.7C140.6 6.8 151.7 0 163.8 0H284.2c12.1 0 23.2 6.8 28.6 17.7L320 32h96c17.7 0 32 14.3 32 32s-14.3 32-32 32H32C14.3 96 0 81.7 0 64S14.3 32 32 32h96l7.2-14.3zM32 128H416V448c0 35.3-28.7 64-64 64H96c-35.3 0-64-28.7-64-64V128zm96 64c-8.8 0-16 7.2-16 16V432c0 8.8 7.2 16 16 16s16-7.2 16-16V208c0-8.8-7.2-16-16-16zm96 0c-8.8 0-16 7.2-16 16V432c0 8.8 7.2 16 16 16s16-7.2 16-16V208c0-8.8-7.2-16-16-16zm96 0c-8.8 0-16 7.2-16 16V432c0 8.8 7.2 16 16 16s16-7.2 16-16V208c0-8.8-7.2-16-16-16z" />
                  </svg>
                </ir-icon>
              )}
            </div>
          </div>
          <div class="d-flex align-items-center">
            <span class=" mr-1">
              {_formatDate(this.item.from_date)} - {_formatDate(this.item.to_date)}
            </span>
            {calendar_data.is_frontdesk_enabled && this.item.unit && <span class="light-blue-bg mr-2 ">{(this.item.unit as IUnit).name}</span>}
            {this.hasCheckIn && <ir-button id="checkin" icon="" class="mr-1" btn_color="info" size="sm" text="Check in"></ir-button>}
            {this.hasCheckOut && <ir-button id="checkout" icon="" btn_color="info" size="sm" text="Check out"></ir-button>}
          </div>
          <div>
            <span class="mr-1">{`${this.item.guest.first_name || ''} ${this.item.guest.last_name || ''}`}</span>
            {this.item.rateplan.selected_variation.adult_nbr > 0 && <span> {this.item.rateplan.selected_variation.adult_child_offering}</span>}
          </div>
          <div class="collapse" id={`roomCollapse-${this.item.identifier.split(' ').join('')}`}>
            <div class="d-flex">
              <div class=" sm-padding-top">
                <strong class="sm-padding-right">{`${this.defaultTexts.entries.Lcz_Breakdown}:`}</strong>
              </div>
              <div class={'flex-fill'}>
                <table>
                  {this.item.days.length > 0 &&
                    this.item.days.map(item => (
                      <tr>
                        <td class={'pr-2 text-right'}>{_getDay(item.date)}</td> <td class="text-right">{_formatAmount(item.amount, this.currency)}</td>
                      </tr>
                    ))}
                  <tr>
                    <th class="text-right pr-2">{this.defaultTexts.entries.Lcz_SubTotal}</th>
                    <th class="text-right">{_formatAmount(this.item.total, this.currency)}</th>
                  </tr>
                  {this.bookingEvent.is_direct ? (
                    <Fragment>
                      {(() => {
                        const filtered_data = calendar_data.taxes.filter(tx => tx.pct > 0);
                        return filtered_data.map(d => {
                          return (
                            <tr>
                              <td class="text-right pr-2">
                                {d.is_exlusive ? this.defaultTexts.entries.Lcz_Excluding : this.defaultTexts.entries.Lcz_Including} {d.name} ({d.pct}%)
                              </td>
                              <td class="text-right">{_formatAmount((this.item.total * d.pct) / 100, this.currency)}</td>
                            </tr>
                          );
                        });
                      })()}
                    </Fragment>
                  ) : (
                    <Fragment>
                      {(() => {
                        const filtered_data = this.item.ota_atxes.filter(tx => tx.amount > 0);
                        return filtered_data.map(d => {
                          return (
                            <tr>
                              <td class="text-right pr-2">
                                {d.is_exlusive ? this.defaultTexts.entries.Lcz_Excluding : this.defaultTexts.entries.Lcz_Including} {d.name}
                              </td>
                              <td class="text-right">
                                {d.currency.symbol}
                                {d.amount}
                              </td>
                            </tr>
                          );
                        });
                      })()}
                    </Fragment>
                  )}
                </table>
              </div>
            </div>
            <div innerHTML={this.item.rateplan.cancelation || ''}></div>
            <div innerHTML={this.item.rateplan.guarantee || ''}></div>
            {/* <ir-label label="PrePayment:" value={this.item.My_Room_type.My_Translated_Prepayment_Policy || ''}></ir-label>
            <ir-label label="Smoking Preference:" value={this.item.My_Room_type.My_Translated_Cancelation_Policy || ''}></ir-label> */}
            <ir-label label={`${this.defaultTexts.entries.Lcz_MealPlan}:`} value={this.mealCodeName}></ir-label>
            {/* <ir-label label={`${this.defaultTexts.entries.Lcz_SpecialRate}:`} value="Non-refundable"></ir-label> */}
          </div>
        </div>
        <ir-modal
          onConfirmModal={this.deleteRoom.bind(this)}
          iconAvailable={true}
          icon="ft-alert-triangle danger h1"
          leftBtnText={this.defaultTexts.entries.Lcz_Cancel}
          rightBtnText={this.defaultTexts.entries.Lcz_Delete}
          leftBtnColor="secondary"
          rightBtnColor="danger"
          modalTitle={this.defaultTexts.entries.Lcz_Confirmation}
          modalBody={`${this.defaultTexts.entries['Lcz_AreYouSureDoYouWantToRemove ']} ${this.item.roomtype.name} ${this.item.unit ? (this.item.unit as IUnit).name : ''} ${
            this.defaultTexts.entries.Lcz_FromThisBooking
          }`}
        ></ir-modal>
      </Host>
    );
  }
}
