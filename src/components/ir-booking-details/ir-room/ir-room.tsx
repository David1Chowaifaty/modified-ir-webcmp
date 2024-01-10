import { Component, h, Prop, EventEmitter, Event, Listen, State, Element, Watch } from '@stencil/core';
import { _formatAmount, _formatDate, _getDay } from '../functions';
import { Booking, IUnit, Room } from '../../../models/booking.dto';
import { TIglBookPropertyPayload } from '../../../models/igl-book-property';
import { formatName } from '../../../utils/booking';
import { IrModal } from '@/components/ir-modal/ir-modal';
import axios from 'axios';

@Component({
  tag: 'ir-room',
  styleUrl: 'ir-room.css',
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
  @Prop() defaultTexts: any;
  @Prop() ticket;

  // Booleans Conditions
  @Prop() hasRoomEdit: boolean = false;
  @Prop() hasRoomDelete: boolean = false;
  @Prop() hasRoomAdd: boolean = false;
  @Prop() hasCheckIn: boolean = false;
  @Prop() hasCheckOut: boolean = false;
  @Element() element;
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

  // _getFoodArrangeCat(catCode: string) {
  //   // get the category from the foodArrangeCats array
  //   const cat = this.mealCode.find((cat: any) => cat.CODE_NAME === catCode);
  //   // return the category
  //   return cat.CODE_VALUE_EN;
  // }
  /*
  
  bookingEvent.defaultDateRange = {};
      bookingEvent.defaultDateRange.fromDate = new Date(bookingEvent.FROM_DATE + 'T00:00:00');
      bookingEvent.defaultDateRange.fromDateStr = this.getDateStr(bookingEvent.defaultDateRange.fromDate);
      bookingEvent.defaultDateRange.fromDateTimeStamp = bookingEvent.defaultDateRange.fromDate.getTime();
      bookingEvent.defaultDateRange.toDate = new Date(bookingEvent.TO_DATE + 'T00:00:00');
      bookingEvent.defaultDateRange.toDateStr = this.getDateStr(bookingEvent.defaultDateRange.toDate);
      bookingEvent.defaultDateRange.toDateTimeStamp = bookingEvent.defaultDateRange.toDate.getTime();
      bookingEvent.defaultDateRange.dateDifference = bookingEvent.NO_OF_DAYS;
  */
  getDateStr(date, locale = 'default') {
    return date.getDate() + ' ' + date.toLocaleString(locale, { month: 'short' }) + ' ' + date.getFullYear();
  }
  handleEditClick() {
    this.editInitiated.emit({
      event_type: 'EDIT_BOOKING',
      ID: this.item['assigned_units_pool'],
      NAME: formatName(this.item.guest.first_name, this.item.guest.last_name),
      EMAIL: this.bookingEvent.guest.last_name,
      PHONE: this.bookingEvent.guest.mobile,
      REFERENCE_TYPE: '',
      FROM_DATE: this.bookingEvent.from_date,
      TO_DATE: this.bookingEvent.to_date,
      TITLE: `${this.defaultTexts.entries.Lcz_EditBookingFor} ${this.item.roomtype.name} ${(this.item.unit as IUnit).name}`,
      defaultDateRange: {
        dateDifference: this.item.days.length,
        fromDate: new Date(this.item.from_date + 'T00:00:00'),
        fromDateStr: this.getDateStr(new Date(this.item.from_date + 'T00:00:00')),
        toDate: new Date(this.item.to_date + 'T00:00:00'),
        toDateStr: this.getDateStr(new Date(this.item.to_date + 'T00:00:00')),
        message: '',
      },
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
      PR_ID: (this.item.unit as IUnit).id,
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
      roomName: (this.item.unit as IUnit).name,
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
      <div class="p-1 d-flex">
        <ir-icon
          id="drawer-icon"
          icon={`${this.collapsed ? 'ft-eye-off' : 'ft-eye'} h2 color-ir-dark-blue-hover`}
          data-toggle="collapse"
          data-target={`#roomCollapse-${this.item.identifier}`}
          aria-expanded="false"
          aria-controls="collapseExample"
          class="sm-padding-right pointer"
          onClick={() => {
            this.collapsed = !this.collapsed;
          }}
        ></ir-icon>
        <div class="w-100">
          <div class="d-flex justify-content-between">
            <div>
              <strong>{this.myRoomTypeFoodCat || ''} </strong> {this.mealCodeName} - {this.item.rateplan.is_non_refundable ? 'Refundable' : 'Non-refundable'}{' '}
              {/*this.item.My_Room_type.My_Room_type_desc[0].CUSTOM_TXT || ''*/}
            </div>
            <div>
              {/* <span class="mr-1">{this.item.TOTAL_AMOUNT + this.item.EXCLUDED_TAXES}</span> */}
              <span class="mr-1">{_formatAmount(this.item.total, this.currency)}</span>
              {this.hasRoomEdit && (
                <ir-icon id={`roomEdit-${this.item.identifier}`} icon="ft-edit color-ir-dark-blue-hover h4 pointer" onClick={this.handleEditClick.bind(this)}></ir-icon>
              )}
              {this.hasRoomDelete && <ir-icon onClick={this.handleDeleteClick.bind(this)} id={`roomDelete-${this.item.identifier}`} icon="ft-trash-2 danger h4 pointer"></ir-icon>}
            </div>
          </div>
          <div>
            <span class="mr-1">{`${this.item.guest.first_name || ''} ${this.item.guest.last_name || ''}`}</span>
            {this.item.rateplan.selected_variation.adult_nbr > 0 && (
              <span>
                {' '}
                {this.item.rateplan.selected_variation.adult_nbr} {this.item.rateplan.selected_variation.adult_nbr > 1 ? 'Adults' : 'Adult'}
              </span>
            )}
            {this.item.rateplan.selected_variation.child_nbr > 0 && (
              <span>
                {' '}
                {this.item.rateplan.selected_variation.child_nbr} {this.item.rateplan.selected_variation.child_nbr > 1 ? 'Children' : 'Child'}
              </span>
            )}
          </div>
          <div class="d-flex align-items-center">
            <span class=" mr-1">
              {_formatDate(this.item.from_date)} - {_formatDate(this.item.to_date)}
            </span>
            {this.item.unit && <span class="light-blue-bg mr-2 ">{(this.item.unit as IUnit).name}</span>}
            {this.hasCheckIn && <ir-button id="checkin" icon="" class="mr-1" btn_color="info" size="sm" text="Check in"></ir-button>}
            {this.hasCheckOut && <ir-button id="checkout" icon="" btn_color="info" size="sm" text="Check out"></ir-button>}
          </div>
          <div class="collapse" id={`roomCollapse-${this.item.identifier}`}>
            <div class="d-flex">
              <div class=" sm-padding-top">
                <strong class="sm-padding-right">Breakdown:</strong>
              </div>
              <div class={'flex-fill'}>
                <table>
                  {this.item.days.length > 0 &&
                    this.item.days.map(item => (
                      <tr>
                        <td class={'pr-2'}>{_getDay(item.date)}</td> <td>{_formatAmount(item.amount, this.currency)}</td>
                      </tr>
                    ))}
                </table>
              </div>
            </div>
            <div innerHTML={this.item.rateplan.cancelation || ''}></div>
            {/* <ir-label label="PrePayment:" value={this.item.My_Room_type.My_Translated_Prepayment_Policy || ''}></ir-label>
            <ir-label label="Smoking Preference:" value={this.item.My_Room_type.My_Translated_Cancelation_Policy || ''}></ir-label> */}
            <ir-label label="Meal Plan:" value={this.mealCodeName}></ir-label>
            <ir-label label="Special rate:" value="Non-refundable"></ir-label>
          </div>
        </div>
        <ir-modal onConfirmModal={this.deleteRoom.bind(this)}></ir-modal>
      </div>
    );
  }
}
