import { Component, h, Prop, EventEmitter, Event, Listen, State, Element, Host, Fragment } from '@stencil/core';
import { _getDay } from '../functions';
import { Booking, IUnit, IVariations, Occupancy, Room } from '@/models/booking.dto';
import { TIglBookPropertyPayload } from '@/models/igl-book-property';
import { formatName } from '@/utils/booking';
import locales from '@/stores/locales.store';
import calendar_data, { isSingleUnit } from '@/stores/calendar-data';
import { colorVariants } from '@/components/ui/ir-icons/icons';
import { formatAmount } from '@/utils/utils';
import { IEntries } from '@/models/IBooking';
import { BookingService } from '@/services/booking.service';
import { OpenSidebarEvent, RoomGuestsPayload } from '../types';
export type RoomModalReason = 'delete' | 'checkin' | 'checkout' | null;
@Component({
  tag: 'ir-room',
  styleUrl: 'ir-room.css',
  scoped: true,
})
export class IrRoom {
  @Element() element: HTMLIrRoomElement;
  // Room Data
  @Prop() booking: Booking;
  @Prop() bookingIndex: number;
  @Prop() isEditable: boolean;
  @Prop() room: Room;
  // Meal Code names
  @Prop() mealCodeName: string;
  @Prop() myRoomTypeFoodCat: string;
  // Currency
  @Prop() currency: string = 'USD';
  @Prop() language: string = 'en';
  @Prop() legendData;
  @Prop() roomsInfo;
  @Prop() bedPreferences: IEntries[];
  // Booleans Conditions
  @Prop() hasRoomEdit: boolean = false;
  @Prop() hasRoomDelete: boolean = false;
  @Prop() hasRoomAdd: boolean = false;
  @Prop() hasCheckIn: boolean = false;
  @Prop() hasCheckOut: boolean = false;

  @State() collapsed: boolean = false;
  @State() isLoading: boolean = false;
  @State() modalReason: RoomModalReason = null;
  // Event Emitters
  @Event({ bubbles: true, composed: true }) deleteFinished: EventEmitter<string>;
  @Event({ bubbles: true, composed: true }) pressCheckIn: EventEmitter;
  @Event({ bubbles: true, composed: true }) pressCheckOut: EventEmitter;
  @Event({ bubbles: true, composed: true }) editInitiated: EventEmitter<TIglBookPropertyPayload>;
  @Event() resetbooking: EventEmitter<null>;
  @Event() openSidebar: EventEmitter<OpenSidebarEvent<RoomGuestsPayload>>;

  private modal: HTMLIrModalElement;
  private bookingService = new BookingService();

  @Listen('clickHandler')
  handleClick(e) {
    let target = e.target;
    if (target.id == 'checkin') {
      this.pressCheckIn.emit(this.room);
    } else if (target.id == 'checkout') {
      this.pressCheckOut.emit(this.room);
    }
  }

  getDateStr(date, locale = 'default') {
    return date.getDate() + ' ' + date.toLocaleString(locale, { month: 'short' }) + ' ' + date.getFullYear();
  }
  handleEditClick() {
    this.editInitiated.emit({
      event_type: 'EDIT_BOOKING',
      ID: this.room['assigned_units_pool'],
      NAME: formatName(this.room.guest.first_name, this.room.guest.last_name),
      EMAIL: this.booking.guest.email,
      PHONE: this.booking.guest.mobile,
      REFERENCE_TYPE: '',
      FROM_DATE: this.booking.from_date,
      TO_DATE: this.booking.to_date,
      TITLE: `${locales.entries.Lcz_EditBookingFor} ${this.room?.roomtype?.name} ${(this.room?.unit as IUnit)?.name || ''}`,
      defaultDateRange: {
        dateDifference: this.room.days.length,
        fromDate: new Date(this.room.from_date + 'T00:00:00'),
        fromDateStr: this.getDateStr(new Date(this.room.from_date + 'T00:00:00')),
        toDate: new Date(this.room.to_date + 'T00:00:00'),
        toDateStr: this.getDateStr(new Date(this.room.to_date + 'T00:00:00')),
        message: '',
      },
      bed_preference: this.room.bed_preference,
      adult_child_offering: this.room.rateplan.selected_variation.adult_child_offering,
      ADULTS_COUNT: this.room.rateplan.selected_variation.adult_nbr,
      ARRIVAL: this.booking.arrival,
      ARRIVAL_TIME: this.booking.arrival.description,
      BOOKING_NUMBER: this.booking.booking_nbr,
      cancelation: this.room.rateplan.cancelation,
      channel_booking_nbr: this.booking.channel_booking_nbr,
      CHILDREN_COUNT: this.room.rateplan.selected_variation.child_nbr,
      COUNTRY: this.booking.guest.country_id,
      ENTRY_DATE: this.booking.from_date,
      FROM_DATE_STR: this.booking.format.from_date,
      guarantee: this.room.rateplan.guarantee,
      GUEST: this.booking.guest,
      IDENTIFIER: this.room.identifier,
      is_direct: this.booking.is_direct,
      IS_EDITABLE: this.booking.is_editable,
      NO_OF_DAYS: this.room.days.length,
      NOTES: this.booking.remark,
      origin: this.booking.origin,
      POOL: this.room['assigned_units_pool'],
      PR_ID: (this.room.unit as IUnit)?.id,
      RATE: this.room.total,
      RATE_PLAN: this.room.rateplan.name,
      RATE_PLAN_ID: this.room.rateplan.id,
      RATE_TYPE: this.room.roomtype.id,
      ROOMS: this.booking.rooms,
      SOURCE: this.booking.source,
      SPLIT_BOOKING: false,
      STATUS: 'IN-HOUSE',
      TO_DATE_STR: this.booking.format.to_date,
      TOTAL_PRICE: this.booking.total,
      legendData: this.legendData,
      roomsInfo: this.roomsInfo,
      roomName: (this.room.unit as IUnit)?.name || '',
      PICKUP_INFO: this.booking.pickup_info,
      booking: this.booking,
      currentRoomType: this.room,
    });
  }
  private openModal(reason: RoomModalReason) {
    if (!reason) {
      return;
    }
    this.modalReason = reason;
    this.modal.openModal();
  }
  private async handleModalConfirmation(e: CustomEvent) {
    try {
      e.stopImmediatePropagation();
      e.stopPropagation();
      if (!this.modalReason) {
        return;
      }
      this.isLoading = true;
      switch (this.modalReason) {
        case 'delete':
          await this.deleteRoom();
          break;
        case 'checkin':
        case 'checkout':
          await this.bookingService.handleExposedRoomInOut({
            booking_nbr: this.booking.booking_nbr,
            room_identifier: this.room.identifier,
            status: this.modalReason === 'checkin' ? '001' : '002',
          });
          this.resetbooking.emit(null);
          break;
        default:
          break;
      }
    } catch (error) {
      console.log(error);
    } finally {
      this.isLoading = false;
      this.modalReason = null;
      this.modal.closeModal();
    }
  }
  private async deleteRoom() {
    let oldRooms = [...this.booking.rooms];
    oldRooms = oldRooms.filter(room => room.identifier !== this.room.identifier);

    const body = {
      assign_units: true,
      check_in: true,
      is_pms: true,
      is_direct: true,
      booking: {
        booking_nbr: this.booking.booking_nbr,
        from_date: this.booking.from_date,
        to_date: this.booking.to_date,
        remark: this.booking.remark,
        property: this.booking.property,
        source: this.booking.source,
        currency: this.booking.currency,
        arrival: this.booking.arrival,
        guest: this.booking.guest,
        rooms: oldRooms,
      },
      extras: this.booking.extras,
      pickup_info: this.booking.pickup_info,
    };
    await this.bookingService.doReservation(body);
    this.deleteFinished.emit(this.room.identifier);
  }

  private formatVariation({ adult_nbr, child_nbr }: IVariations, { infant_nbr }: Occupancy) {
    // Adjust child number based on infants
    const adjustedChildNbr = child_nbr;

    // Define labels based on singular/plural rules
    const adultLabel = adult_nbr > 1 ? locales.entries.Lcz_Adults.toLowerCase() : locales.entries.Lcz_Adult.toLowerCase();
    const childLabel = adjustedChildNbr > 1 ? locales.entries.Lcz_Children.toLowerCase() : locales.entries.Lcz_Child.toLowerCase();
    const infantLabel = infant_nbr > 1 ? locales.entries.Lcz_Infants.toLowerCase() : locales.entries.Lcz_Infant.toLowerCase();

    // Construct parts with the updated child number
    const parts = [`${adult_nbr} ${adultLabel}`, adjustedChildNbr ? `${adjustedChildNbr} ${childLabel}` : '', infant_nbr ? `${infant_nbr} ${infantLabel}` : ''];

    // Join non-empty parts with spaces
    return parts.filter(Boolean).join('&nbsp&nbsp&nbsp&nbsp');
  }
  private getBedName() {
    const bed = this.bedPreferences.find(p => p.CODE_NAME === this.room.bed_preference.toString());
    if (!bed) {
      throw new Error(`bed with code ${this.room.bed_preference} not found`);
    }
    return bed[`CODE_VALUE_${this.language}`] ?? bed.CODE_VALUE_EN;
  }
  private renderModalMessage() {
    switch (this.modalReason) {
      case 'delete':
        return `${locales.entries['Lcz_AreYouSureDoYouWantToRemove ']} ${this.room.roomtype.name} ${this.room.unit ? (this.room.unit as IUnit).name : ''} ${
          locales.entries.Lcz_FromThisBooking
        }`;
      case 'checkin':
        return `Check in ${this.room.roomtype.name} ${this.room.unit ? (this.room.unit as IUnit).name : ''} ${locales.entries.Lcz_FromThisBooking}`;
      case 'checkout':
        return `Checkout ${this.room.roomtype.name} ${this.room.unit ? (this.room.unit as IUnit).name : ''} ${locales.entries.Lcz_FromThisBooking}`;
      default:
        return '';
    }
  }
  render() {
    return (
      <Host class="p-1 d-flex m-0">
        <ir-button
          variant="icon"
          id="drawer-icon"
          data-toggle="collapse"
          data-target={`#roomCollapse-${this.room.identifier?.split(' ').join('')}`}
          aria-expanded={this.collapsed ? 'true' : 'false'}
          aria-controls="myCollapse"
          class="mr-1"
          icon_name={this.collapsed ? 'closed_eye' : 'open_eye'}
          onClickHandler={() => {
            this.collapsed = !this.collapsed;
          }}
          style={{ '--icon-size': '1.6rem' }}
        ></ir-button>

        <div class="flex-fill m-0 ">
          <div class="d-flex align-rooms-start justify-content-between sm-mb-1">
            <p class="m-0 p-0">
              <span class="m-0 p-0" style={{ fontWeight: '600' }}>
                {this.myRoomTypeFoodCat || ''}{' '}
              </span>{' '}
              {this.mealCodeName} {this.room.rateplan.is_non_refundable && ` - ${locales.entries.Lcz_NonRefundable}`}{' '}
            </p>
            {/*this.room.My_Room_type.My_Room_type_desc[0].CUSTOM_TXT || ''*/}
            <div class="d-flex m-0 p-0 align-rooms-center room_actions_btns">
              <span class="p-0 m-0 font-weight-bold">{formatAmount(this.currency, this.room['gross_total'])}</span>
              {this.hasRoomEdit && this.isEditable && (
                <ir-button
                  id={`roomEdit-${this.room.identifier}`}
                  variant="icon"
                  icon_name="edit"
                  // class="mx-1"
                  style={colorVariants.secondary}
                  onClickHandler={this.handleEditClick.bind(this)}
                ></ir-button>
              )}
              {this.hasRoomDelete && this.isEditable && (
                <ir-button
                  variant="icon"
                  onClickHandler={this.openModal.bind(this, 'delete')}
                  id={`roomDelete-${this.room.identifier}`}
                  icon_name="trash"
                  style={colorVariants.danger}
                ></ir-button>
              )}
            </div>
          </div>
          <div class="d-flex align-rooms-center sm-mb-1">
            <ir-date-view
              class="mr-1  flex-grow-1"
              style={{ width: 'fit-content' }}
              from_date={this.room.from_date}
              to_date={this.room.to_date}
              showDateDifference={false}
            ></ir-date-view>
            {!isSingleUnit(this.room.roomtype.id) && calendar_data.is_frontdesk_enabled && this.room.unit && (
              <div class={'d-flex justify-content-center align-items-center'} title={(this.room.unit as IUnit).name}>
                <span class={`light-blue-bg  ${this.hasCheckIn || this.hasCheckOut ? 'mr-2' : ''} `}>{(this.room.unit as IUnit).name}</span>
              </div>
            )}
            {this.hasCheckIn && (
              <ir-button onClickHandler={this.openModal.bind(this, 'checkin')} id="checkin" btn_color="outline" size="sm" text={locales.entries.Lcz_CheckIn}></ir-button>
            )}
            {this.hasCheckOut && (
              <ir-button onClickHandler={this.openModal.bind(this, 'checkout')} id="checkout" btn_color="outline" size="sm" text={locales.entries.Lcz_CheckOut}></ir-button>
            )}
          </div>

          <div class={'d-flex align-items-center'}>
            <span class="mr-1">{`${this.room.guest.first_name || ''} ${this.room.guest.last_name || ''}`}</span>
            {/* {this.room.rateplan.selected_variation.adult_nbr > 0 && <span> {this.room.rateplan.selected_variation.adult_child_offering}</span>} */}
            {this.room.rateplan.selected_variation.adult_nbr > 0 && (
              <ir-button
                btn_color="link"
                onClickHandler={() => this.showGuestModal()}
                size="sm"
                text={this.formatVariation(this.room.rateplan.selected_variation, this.room.occupancy)}
              ></ir-button>
            )}
            {this.room.bed_preference && <span>({this.getBedName()})</span>}
          </div>
          <div class="collapse" id={`roomCollapse-${this.room.identifier?.split(' ').join('')}`}>
            <div class="d-flex sm-mb-1 sm-mt-1">
              <div class=" sm-padding-top">
                <p class="sm-padding-right" style={{ fontWeight: '600' }}>{`${locales.entries.Lcz_Breakdown}:`}</p>
              </div>
              <div class={'flex-fill'}>
                <table>
                  {this.room.days.length > 0 &&
                    this.room.days.map(room => {
                      return (
                        <tr>
                          <td class={'pr-2 text-right'}>{_getDay(room.date)}</td>
                          <td class="text-right">{formatAmount(this.currency, room.amount)}</td>
                          {room.cost > 0 && room.cost !== null && <td class="pl-2 text-left night-cost">{formatAmount(this.currency, room.cost)}</td>}
                        </tr>
                      );
                    })}
                  <tr class={''}>
                    <th class="text-right pr-2 subtotal_row">{locales.entries.Lcz_SubTotal}</th>
                    <th class="text-right subtotal_row">{formatAmount(this.currency, this.room.total)}</th>
                    {this.room.gross_cost > 0 && this.room.gross_cost !== null && <th class="pl-2 text-right night-cost">{formatAmount(this.currency, this.room.cost)}</th>}
                  </tr>
                  {this.booking.is_direct ? (
                    <Fragment>
                      {(() => {
                        const filtered_data = calendar_data.taxes.filter(tx => tx.pct > 0);
                        return filtered_data.map(d => {
                          return (
                            <tr>
                              <td class="text-right pr-2">
                                {d.is_exlusive ? locales.entries.Lcz_Excluding : locales.entries.Lcz_Including} {d.name} ({d.pct}%)
                              </td>
                              <td class="text-right">{formatAmount(this.currency, (this.room.total * d.pct) / 100)}</td>
                              {this.room.gross_cost > 0 && this.room.gross_cost !== null && (
                                <td class="pl-2 text-right night-cost">{formatAmount(this.currency, (this.room.cost * d.pct) / 100)}</td>
                              )}
                            </tr>
                          );
                        });
                      })()}
                    </Fragment>
                  ) : (
                    <Fragment>
                      {(() => {
                        const filtered_data = this.room.ota_taxes.filter(tx => tx.amount > 0);
                        return filtered_data.map(d => {
                          return (
                            <tr>
                              <td class="text-right pr-2">
                                {d.is_exlusive ? locales.entries.Lcz_Excluding : locales.entries.Lcz_Including} {d.name}
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
            {this.booking.is_direct && (
              <Fragment>
                {this.room.rateplan.cancelation && (
                  <ir-label labelText={`${locales.entries.Lcz_Cancellation}:`} content={this.room.rateplan.cancelation || ''} renderContentAsHtml></ir-label>
                )}
                {this.room.rateplan.guarantee && (
                  <ir-label labelText={`${locales.entries.Lcz_Guarantee}:`} content={this.room.rateplan.guarantee || ''} renderContentAsHtml></ir-label>
                )}
              </Fragment>
            )}
            {/* {this.booking.is_direct && <ir-label labelText={`${locales.entries.Lcz_MealPlan}:`} content={this.mealCodeName}></ir-label>} */}
          </div>
        </div>
        <ir-modal
          autoClose={false}
          ref={el => (this.modal = el)}
          isLoading={this.isLoading}
          onConfirmModal={this.handleModalConfirmation.bind(this)}
          iconAvailable={true}
          icon="ft-alert-triangle danger h1"
          leftBtnText={locales.entries.Lcz_Cancel}
          rightBtnText={this.modalReason === 'delete' ? locales.entries.Lcz_Delete : locales.entries.Lcz_Confirm}
          leftBtnColor="secondary"
          rightBtnColor={this.modalReason === 'delete' ? 'danger' : 'primary'}
          modalTitle={locales.entries.Lcz_Confirmation}
          modalBody={this.renderModalMessage()}
        ></ir-modal>
      </Host>
    );
  }
  private showGuestModal(): void {
    const { adult_nbr, children_nbr, infant_nbr } = this.room.occupancy;
    this.openSidebar.emit({
      type: 'room-guest',
      payload: {
        roomName: (this.room.unit as IUnit).name,
        sharing_persons: this.room.sharing_persons,
        totalGuests: adult_nbr + children_nbr + infant_nbr,
        checkin: this.hasCheckIn,
        identifier: this.room.identifier,
      },
    });
  }
}
