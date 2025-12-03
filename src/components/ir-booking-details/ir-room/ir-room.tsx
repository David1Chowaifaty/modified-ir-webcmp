import { Component, h, Prop, EventEmitter, Event, Listen, State, Element, Host, Fragment, Watch } from '@stencil/core';
import { _getDay } from '../functions';
import { Booking, IUnit, Occupancy, Room, SharedPerson } from '@/models/booking.dto';
import { TIglBookPropertyPayload } from '@/models/igl-book-property';
import { formatName } from '@/utils/booking';
import locales from '@/stores/locales.store';
import calendar_data, { isSingleUnit } from '@/stores/calendar-data';
import { formatAmount } from '@/utils/utils';
import { IEntries } from '@/models/IBooking';
import { BookingService } from '@/services/booking.service';
import { OpenSidebarEvent, RoomGuestsPayload } from '../types';
import { IToast } from '@/components/ui/ir-toast/toast';
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
  @Prop() property_id: number;
  @Prop() includeDepartureTime: boolean;
  // Meal Code names
  @Prop() mealCodeName: string;
  @Prop() myRoomTypeFoodCat: string;
  // Currency
  @Prop() currency: string = 'USD';
  @Prop() language: string = 'en';
  @Prop() legendData;
  @Prop() roomsInfo;
  @Prop() bedPreferences: IEntries[];
  @Prop() departureTime: IEntries[];
  // Booleans Conditions
  @Prop() hasRoomEdit: boolean = false;
  @Prop() hasRoomDelete: boolean = false;
  @Prop() hasRoomAdd: boolean = false;
  @Prop() hasCheckIn: boolean = false;
  @Prop() hasCheckOut: boolean = false;

  @State() collapsed: boolean = true;
  @State() isLoading: boolean = false;
  @State() modalReason: RoomModalReason = null;
  @State() mainGuest: SharedPerson;
  @State() isModelOpen: boolean = false;

  // Event Emitters
  @Event({ bubbles: true, composed: true }) deleteFinished: EventEmitter<string>;
  @Event({ bubbles: true, composed: true }) toast: EventEmitter<IToast>;
  @Event({ bubbles: true, composed: true }) pressCheckIn: EventEmitter;
  @Event({ bubbles: true, composed: true }) pressCheckOut: EventEmitter;
  @Event({ bubbles: true, composed: true }) editInitiated: EventEmitter<TIglBookPropertyPayload>;
  @Event() resetbooking: EventEmitter<null>;
  @Event() openSidebar: EventEmitter<OpenSidebarEvent<RoomGuestsPayload>>;

  private modal: HTMLIrDialogElement;
  private bookingService = new BookingService();
  dialogRef: HTMLIrDialogElement;

  componentWillLoad() {
    this.mainGuest = this.getMainGuest();
  }
  // In your class

  @Listen('clickHandler')
  handleClick(e) {
    let target = e.target;
    if (target.id == 'checkin') {
      this.pressCheckIn.emit(this.room);
    } else if (target.id == 'checkout') {
      this.pressCheckOut.emit(this.room);
    }
  }
  @Watch('room')
  handleRoomDataChange() {
    this.mainGuest = this.getMainGuest();
  }

  private getDateStr(date, locale = 'default') {
    return date.getDate() + ' ' + date.toLocaleString(locale, { month: 'short' }) + ' ' + date.getFullYear();
  }
  private handleEditClick() {
    this.editInitiated.emit({
      event_type: 'EDIT_BOOKING',
      ID: this.room['assigned_units_pool'],
      NAME: formatName(this.mainGuest?.first_name, this.mainGuest?.last_name),
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
      GUEST: this.mainGuest,
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
  private async updateDepartureTime(code: string) {
    try {
      await this.bookingService.setDepartureTime({
        property_id: this.property_id,
        code,
        room_identifier: this.room.identifier,
      });
      this.toast.emit({
        type: 'success',
        description: '',
        title: 'Saved Successfully',
        position: 'top-right',
      });
    } catch (error) {
      console.log(error);
    }
  }
  private formatVariation({ infant_nbr, adult_nbr, children_nbr }: Occupancy) {
    const adultCount = adult_nbr > 0 ? adult_nbr : 0;
    const childCount = children_nbr > 0 ? children_nbr : 0;
    const infantCount = infant_nbr > 0 ? infant_nbr : 0;

    const adultLabel = adultCount > 1 ? locales.entries.Lcz_Adults.toLowerCase() : locales.entries.Lcz_Adult.toLowerCase();
    const childLabel = childCount > 1 ? locales.entries.Lcz_Children.toLowerCase() : locales.entries.Lcz_Child.toLowerCase();
    const infantLabel = infantCount > 1 ? locales.entries.Lcz_Infants.toLowerCase() : locales.entries.Lcz_Infant.toLowerCase();

    const parts = [];
    if (adultCount > 0) {
      parts.push(`${adultCount} ${adultLabel}`);
    }
    if (childCount > 0) {
      parts.push(`${childCount} ${childLabel}`);
    }
    if (infantCount > 0) {
      parts.push(`${infantCount} ${infantLabel}`);
    }

    return parts.join('&nbsp&nbsp&nbsp&nbsp');
  }
  private getSmokingLabel() {
    if (this.booking.is_direct) {
      if (!this.room.smoking_option) {
        return null;
      }
      const currRT = calendar_data.roomsInfo.find(rt => rt.id === this.room.roomtype.id);
      if (currRT) {
        const smoking_option = currRT['smoking_option']?.allowed_smoking_options;
        if (smoking_option) {
          return smoking_option.find(s => s.code === this.room.smoking_option)?.description;
        }
        return null;
      }
      return null;
    }
    return this.room.ota_meta?.smoking_preferences;
  }

  private getBedName() {
    if (this.booking.is_direct) {
      const bed = this.bedPreferences.find(p => p.CODE_NAME === this.room?.bed_preference?.toString());
      if (!bed) {
        return;
      }
      return bed[`CODE_VALUE_${this.language}`] ?? bed.CODE_VALUE_EN;
    }
    return this.room.ota_meta?.bed_preferences;
  }
  private renderModalMessage() {
    switch (this.modalReason) {
      case 'delete':
        return `${locales.entries['Lcz_AreYouSureDoYouWantToRemove ']} ${this.room.roomtype.name} ${this.room.unit ? (this.room.unit as IUnit).name : ''} ${
          locales.entries.Lcz_FromThisBooking
        }`;
      case 'checkin':
        return `Are you sure you want to Check In this unit?
`;
      case 'checkout':
        return `Are you sure you want to Check Out this unit?`;
      default:
        return '';
    }
  }
  private handleCheckIn() {
    const { adult_nbr, children_nbr, infant_nbr } = this.room.occupancy;
    if (this.room.sharing_persons.length < adult_nbr + children_nbr + infant_nbr) {
      return this.showGuestModal();
    }
    return this.renderModalMessage();
  }
  private getMainGuest() {
    return this.room.sharing_persons?.find(p => p.is_main);
  }

  render() {
    const bed = this.getBedName();
    return (
      <Host>
        <div class="d-flex m-0" style={{ gap: 'var(--spacing)' }}>
          <button data-state={this.collapsed ? 'closed' : 'opened'} class="booking-room__collapse-btn" onClick={() => (this.collapsed = !this.collapsed)}>
            <wa-icon name="chevron-right"></wa-icon>
          </button>
          <div style={{ width: '100%', cursor: 'default' }}>
            <div
              // slot="summary"
              class="booking-room_summary"
              style={{ width: '100%', cursor: 'default' }}
            >
              <div class="d-flex align-items-center justify-content-between">
                <p class="m-0 p-0">
                  <span class="m-0 p-0" style={{ fontWeight: '600' }}>
                    {this.myRoomTypeFoodCat || ''}{' '}
                  </span>{' '}
                  {this.mealCodeName} {this.room.rateplan.is_non_refundable && ` - ${locales.entries.Lcz_NonRefundable}`}{' '}
                </p>

                {/*this.room.My_Room_type.My_Room_type_desc[0].CUSTOM_TXT || ''*/}
                <div class="booking-room__price-row">
                  <span class="booking-room__price">{formatAmount(this.currency, this.room['gross_total'])}</span>

                  <div class="booking-room__actions">
                    {this.hasRoomEdit && this.isEditable && (
                      <Fragment>
                        <wa-tooltip for={`edit-room-${this.room.identifier}`}>Edit {this.room.roomtype.name}</wa-tooltip>
                        <ir-custom-button
                          iconBtn
                          id={`edit-room-${this.room.identifier}`}
                          class="booking-room__edit-button"
                          onClickHandler={this.handleEditClick.bind(this)}
                          variant="neutral"
                          size="small"
                          appearance="plain"
                        >
                          <wa-icon label="Edit room" class="booking-room__edit-icon" name="edit" style={{ fontSize: '1rem' }}></wa-icon>
                        </ir-custom-button>
                      </Fragment>
                    )}

                    {this.hasRoomDelete && this.isEditable && (
                      <Fragment>
                        <wa-tooltip for={`delete-room-${this.room.identifier}`}>Delete {this.room.roomtype.name}</wa-tooltip>
                        <ir-custom-button
                          iconBtn
                          id={`delete-room-${this.room.identifier}`}
                          class="booking-room__delete-button"
                          onClickHandler={this.openModal.bind(this, 'delete')}
                          variant="danger"
                          size="small"
                          appearance="plain"
                        >
                          <wa-icon label="Delete room" class="booking-room__delete-icon" name="trash-can" style={{ fontSize: '1rem' }}></wa-icon>
                        </ir-custom-button>
                      </Fragment>
                    )}
                  </div>
                </div>
              </div>
              <div class="d-flex align-items-center">
                <ir-date-view
                  class="mr-1  flex-grow-1"
                  style={{ width: 'fit-content' }}
                  from_date={this.room.from_date}
                  to_date={this.room.to_date}
                  showDateDifference={false}
                ></ir-date-view>
                {!isSingleUnit(this.room.roomtype.id) && calendar_data.is_frontdesk_enabled && this.room.unit && (
                  // <div class={'d-flex justify-content-center align-items-center'}>
                  //   <ir-tooltip message={(this.room.unit as IUnit).name} customSlot>
                  //     <span slot="tooltip-trigger" class={`light-blue-bg  ${this.hasCheckIn || this.hasCheckOut ? 'mr-2' : ''} `}>
                  //       {(this.room.unit as IUnit).name}
                  //     </span>
                  //   </ir-tooltip>
                  // </div>
                  <ir-unit-tag unit={(this.room.unit as IUnit).name}></ir-unit-tag>
                )}
                {this.hasCheckIn && (
                  <ir-custom-button onClickHandler={this.handleCheckIn.bind(this)} id="checkin" appearance="outlined" variant="brand">
                    {locales.entries.Lcz_CheckIn}
                  </ir-custom-button>
                )}
                {this.hasCheckOut && (
                  <ir-custom-button appearance="outlined" variant="brand" onClickHandler={this.openModal.bind(this, 'checkout')} id="checkout">
                    {locales.entries.Lcz_CheckOut}
                  </ir-custom-button>
                )}
              </div>
              <div class={'d-flex align-items-center'} style={{ gap: '0.5rem' }}>
                <p class="m-0 p-0">{`${this.mainGuest.first_name || ''} ${this.mainGuest.last_name || ''}`}</p>
                {this.room.rateplan.selected_variation.adult_nbr > 0 &&
                  (this.room.unit ? (
                    // <ir-tooltip message={'View guests'} class="m-0 p-0" customSlot>
                    //   <ir-button
                    //     class="m-0 p-0"
                    //     slot="tooltip-trigger"
                    //     btn_color="link"
                    //     renderContentAsHtml
                    //     onClickHandler={() => this.showGuestModal()}
                    //     size="sm"
                    //     btnStyle={{ width: 'fit-content', margin: '0', padding: '0', fontSize: 'inherit', textAlign: 'center', lineHeight: '1.2' }}
                    //     text={this.formatVariation(this.room.occupancy)}
                    //   ></ir-button>
                    // </ir-tooltip>
                    <Fragment>
                      <wa-tooltip for={`view-guest-btn-${this.room.identifier}`}>View guests</wa-tooltip>
                      <ir-custom-button link onClickHandler={() => this.showGuestModal()} id={`view-guest-btn-${this.room.identifier}`} variant="brand" appearance="plain">
                        <span innerHTML={this.formatVariation(this.room.occupancy)}></span>
                      </ir-custom-button>
                    </Fragment>
                  ) : (
                    <span innerHTML={this.formatVariation(this.room.occupancy)}></span>
                  ))}
                {bed && <p class="m-0 p-0">({bed})</p>}
              </div>
              {this.includeDepartureTime && (
                <div class="d-flex align-items-center" style={{ marginTop: '0.5rem', marginBottom: '0.875rem', gap: '0.5rem' }}>
                  <p class="m-0 p-0">Expected departure time:</p>
                  {/* <ir-select
                  selectedValue={this.room.departure_time?.code}
                  showFirstOption={false}
                  onSelectChange={e => {
                    this.updateDepartureTime(e.detail);
                  }}
                  data={this.departureTime?.map(d => ({
                    text: d[`CODE_VALUE_${this.language?.toUpperCase()}`] ?? d[`CODE_VALUE_EN`],
                    value: d.CODE_NAME,
                  }))}
                ></ir-select> */}
                  <wa-select
                    onchange={e => {
                      this.updateDepartureTime((e.target as any).value);
                    }}
                    style={{ width: '140px' }}
                    size="small"
                    placeholder="Not provided"
                    value={this.room.departure_time?.code}
                    defaultValue={this.room.departure_time?.code}
                  >
                    {this.departureTime?.map(dt => (
                      <wa-option key={dt.CODE_NAME} value={dt.CODE_NAME}>
                        {dt[`CODE_VALUE_${this.language?.toUpperCase()}`] ?? dt[`CODE_VALUE_EN`]}
                      </wa-option>
                    ))}
                  </wa-select>
                </div>
              )}
            </div>

            {!this.collapsed && (
              <div class="booking-room__details-container">
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
                <ir-label labelText={`${locales.entries.Lcz_SmokingOptions}:`} display="inline" content={this.getSmokingLabel()}></ir-label>
                {this.booking.is_direct && (
                  <Fragment>
                    {this.room.rateplan.cancelation && (
                      <ir-label labelText={`${locales.entries.Lcz_Cancellation}:`} display="inline" content={this.room.rateplan.cancelation || ''} renderContentAsHtml></ir-label>
                    )}
                    {this.room.rateplan.guarantee && (
                      <ir-label labelText={`${locales.entries.Lcz_Guarantee}:`} display="inline" content={this.room.rateplan.guarantee || ''} renderContentAsHtml></ir-label>
                    )}
                  </Fragment>
                )}
                {this.room.ota_meta && (
                  <div>
                    <ir-label labelText={`${locales.entries.Lcz_MealPlan}:`} display="inline" content={this.room.ota_meta.meal_plan}></ir-label>
                    <ir-label labelText={`${locales.entries.Lcz_Policies}:`} display="inline" content={this.room.ota_meta.policies}></ir-label>
                  </div>
                )}
                {/* {this.bookingEvent.is_direct && <ir-label labelText={`${locales.entries.Lcz_MealPlan}:`} content={this.mealCodeName}></ir-label>} */}
              </div>
            )}
          </div>
        </div>
        <ir-dialog
          label={this.modalReason === 'delete' ? 'Alert' : locales.entries.Lcz_Confirmation}
          ref={el => (this.modal = el)}
          onIrDialogHide={e => {
            e.stopImmediatePropagation();
            e.stopPropagation();
          }}
          onIrDialogAfterHide={e => {
            e.stopImmediatePropagation();
            e.stopPropagation();
            this.modalReason = null;
          }}
          lightDismiss={this.modalReason === 'checkin'}
        >
          <p>{this.renderModalMessage()}</p>
          <div slot="footer" class="ir-dialog__footer">
            <ir-custom-button size="medium" data-dialog="close" appearance="filled" variant="neutral">
              {locales.entries.Lcz_Cancel}
            </ir-custom-button>
            <ir-custom-button
              size="medium"
              loading={this.isLoading}
              onClickHandler={e => this.handleModalConfirmation(e)}
              variant={this.modalReason === 'delete' ? 'danger' : 'brand'}
            >
              {this.modalReason === 'delete' ? locales.entries.Lcz_Delete : locales.entries.Lcz_Confirm}
            </ir-custom-button>
          </div>
        </ir-dialog>
      </Host>
    );
  }
  private showGuestModal(): void {
    const { adult_nbr, children_nbr, infant_nbr } = this.room.occupancy;
    this.openSidebar.emit({
      type: 'room-guest',
      payload: {
        roomName: (this.room.unit as IUnit)?.name,
        sharing_persons: this.room.sharing_persons,
        totalGuests: adult_nbr + children_nbr + infant_nbr,
        checkin: this.hasCheckIn,
        identifier: this.room.identifier,
      },
    });
  }
}
