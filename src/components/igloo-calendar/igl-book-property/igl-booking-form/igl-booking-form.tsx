import { Component, Prop, h, Event, EventEmitter, Host, State } from '@stencil/core';
import { IPageTwoDataUpdateProps } from '@/models/models';
import { IglBookPropertyPayloadEditBooking, TPropertyButtonsTypes } from '../../../../models/igl-book-property';
import { formatAmount } from '@/utils/utils';
import locales from '@/stores/locales.store';
import { ICurrency } from '@/models/calendarData';
import booking_store, { IRatePlanSelection } from '@/stores/booking.store';
import calendar_data from '@/stores/calendar-data';
import moment from 'moment';
@Component({
  tag: 'igl-booking-form',
  styleUrl: 'igl-booking-form.css',
  scoped: true,
})
export class IglBookingForm {
  @Prop() showPaymentDetails: boolean;
  @Prop() currency: ICurrency;
  @Prop({ reflect: true }) isEditOrAddRoomEvent: boolean;
  @Prop() dateRangeData: { [key: string]: any };
  @Prop() bookingData: { [key: string]: any };
  @Prop() showSplitBookingOption: boolean;
  @Prop() language: string;
  @Prop() bookedByInfoData: { [key: string]: any };
  @Prop() propertyId: number;
  @Prop() bedPreferenceType: any;
  @Prop() selectedRooms: Map<string, Map<string, any>>;
  @Prop({ reflect: true }) isLoading: string;
  @Prop() countryNodeList;
  @Prop() selectedGuestData;
  @Prop() defaultGuestData: IglBookPropertyPayloadEditBooking;

  @State() selectedBookedByData;
  @State() guestData: any;
  @State() selectedUnits: { [key: string]: any } = {};

  @Event() dataUpdateEvent: EventEmitter<IPageTwoDataUpdateProps>;
  @Event() buttonClicked: EventEmitter<{
    key: TPropertyButtonsTypes;
    data?: CustomEvent;
  }>;

  componentWillLoad() {
    this.initializeGuestData();
    this.selectedBookedByData = this.bookedByInfoData;
  }

  initializeGuestData() {
    let total = 0;
    const newSelectedUnits = { ...this.selectedUnits };
    const getRate = (rate: number, totalNights: number, isRateModified: boolean, preference: number) => {
      if (isRateModified && preference === 2) {
        return rate * totalNights;
      }
      return rate;
    };
    this.selectedUnits = newSelectedUnits;
    this.guestData = [];
    this.selectedRooms.forEach((room, key) => {
      room.forEach(rate_plan => {
        newSelectedUnits[key] = rate_plan.selectedUnits;
        total += rate_plan.totalRooms * getRate(rate_plan.rate, this.dateRangeData.dateDifference, rate_plan.isRateModified, rate_plan.rateType);
        for (let i = 1; i <= rate_plan.totalRooms; i++) {
          this.guestData.push({
            guestName: '',
            roomId: '',
            preference: '',
            ...rate_plan,
          });
        }
      });
    });
    this.bookingData.TOTAL_PRICE = total;
  }
  handleOnApplicationInfoDataUpdateEvent(event: CustomEvent, index: number) {
    const opt = event.detail;
    const categoryIdKey = `c_${opt.data.roomCategoryId}`;
    const updatedUnits = [...(this.selectedUnits[categoryIdKey] || [])];
    updatedUnits[index] = opt.data.roomId;
    this.selectedUnits = {
      ...this.selectedUnits,
      [categoryIdKey]: updatedUnits,
    };
    this.dataUpdateEvent.emit({
      key: 'applicationInfoUpdateEvent',
      value: event.detail,
    });
  }

  handleEventData(event: any, key: string, index: number) {
    if (key === 'application-info') {
      this.handleOnApplicationInfoDataUpdateEvent(event, index);
    } else {
      this.selectedBookedByData = event.detail.data;
      this.dataUpdateEvent.emit({
        key: 'propertyBookedBy',
        value: event.detail,
      });
    }
  }
  isGuestDataIncomplete() {
    if (this.selectedGuestData.length !== this.guestData.length) {
      return true;
    }
    for (const data of this.selectedGuestData) {
      if (data.guestName === '' || data.preference === '' || data.roomId === '') {
        return true;
      }
    }
    return false;
  }
  isButtonDisabled(key: string) {
    const isValidProperty = (property, key, comparedBy) => {
      if (!property) {
        return true;
      }
      if (property === this.selectedGuestData) {
        return this.isGuestDataIncomplete();
      }
      if (key === 'selectedArrivalTime') {
        if (property[key] !== undefined) {
          return property[key].code === '';
        } else {
          return true;
        }
      }
      return property[key] === comparedBy || property[key] === undefined;
    };
    return (
      this.isLoading === key ||
      isValidProperty(this.selectedGuestData, 'guestName', '') ||
      isValidProperty(this.selectedBookedByData, 'isdCode', '') ||
      isValidProperty(this.selectedBookedByData, 'contactNumber', '') ||
      isValidProperty(this.selectedBookedByData, 'firstName', '') ||
      isValidProperty(this.selectedBookedByData, 'lastName', '') ||
      isValidProperty(this.selectedBookedByData, 'countryId', -1) ||
      isValidProperty(this.selectedBookedByData, 'selectedArrivalTime', '') ||
      isValidProperty(this.selectedBookedByData, 'email', '')
    );
  }

  render() {
    const showBookAndCheckin = calendar_data.checkin_enabled && moment(new Date(this.dateRangeData?.fromDate)).isSame(new Date(), 'day');
    return (
      <Host>
        <div class="d-flex flex-wrap">
          <ir-date-view
            class="mr-1 flex-fill font-weight-bold font-medium-1"
            from_date={new Date(this.dateRangeData.fromDate)}
            to_date={new Date(this.dateRangeData.toDate)}
            dateOption="DD MMM YYYY"
          ></ir-date-view>
          {this.guestData.length > 1 && (
            <div class="mt-1 mt-md-0 text-right">
              {locales.entries.Lcz_TotalPrice} <span class="font-weight-bold font-medium-1">{formatAmount(this.currency.symbol, this.bookingData.TOTAL_PRICE || '0')}</span>
            </div>
          )}
        </div>
        {Object.values(booking_store.ratePlanSelections).map(val =>
          Object.values(val).map(ratePlan => {
            const rp = ratePlan as IRatePlanSelection;
            if (rp.reserved === 0) {
              return null;
            }

            return [...new Array(rp.reserved)].map((_, i) => (
              <igl-application-info
                totalNights={Number(this.dateRangeData.dateDifference)}
                bedPreferenceType={this.bedPreferenceType}
                currency={this.currency}
                guestInfo={rp.guest ? rp.guest[i] : null}
                bookingType={this.bookingData.event_type}
                rateplanSelection={rp}
                key={`${rp.ratePlan.id}_${i}`}
                roomIndex={i}
                baseData={
                  this.bookingData.event_type === 'EDIT_BOOKING'
                    ? {
                        roomtypeId: this.bookingData.currentRoomType.roomtype.id,
                        unit: this.bookingData.currentRoomType.unit,
                      }
                    : undefined
                }
              ></igl-application-info>
            ));
          }),
        )}

        {this.isEditOrAddRoomEvent || this.showSplitBookingOption ? null : (
          <igl-property-booked-by
            propertyId={this.propertyId}
            countryNodeList={this.countryNodeList}
            language={this.language}
            showPaymentDetails={this.showPaymentDetails}
            defaultData={this.bookedByInfoData}
            onDataUpdateEvent={event => {
              this.handleEventData(event, 'propertyBookedBy', 0);
            }}
          ></igl-property-booked-by>
        )}

        {this.isEditOrAddRoomEvent ? (
          <div class="d-flex p-0 mb-1 mt-2">
            <div class="flex-fill mr-2">
              <ir-button
                icon=""
                text={locales.entries.Lcz_Back}
                class="full-width"
                btn_color="secondary"
                btn_styles="justify-content-center"
                onClickHandler={() => this.buttonClicked.emit({ key: 'back' })}
              ></ir-button>
            </div>
            <div class="flex-fill">
              <ir-button
                isLoading={this.isLoading === 'save'}
                onClickHandler={() => this.buttonClicked.emit({ key: 'save' })}
                btn_styles="full-width align-items-center justify-content-center"
                text={locales.entries.Lcz_Save}
              ></ir-button>
            </div>
          </div>
        ) : (
          <div class="d-flex flex-column flex-md-row p-0 mb-1 mt-2 justify-content-md-between align-items-md-center">
            <div class="flex-fill mr-md-1">
              <ir-button
                icon_name="angles_left"
                btn_color="secondary"
                btn_styles="full-width align-items-center justify-content-center"
                onClickHandler={() => this.buttonClicked.emit({ key: 'back' })}
                text={locales.entries.Lcz_Back}
                style={{ '--icon-size': '1rem' }}
                icon_style={{ paddingBottom: '1.9px' }}
              ></ir-button>
            </div>
            <div class={`mt-1 mt-md-0 flex-fill ${showBookAndCheckin ? 'mr-md-1' : ''}`}>
              <ir-button
                isLoading={this.isLoading === 'book'}
                btn_styles="full-width align-items-center justify-content-center"
                onClickHandler={() => this.buttonClicked.emit({ key: 'book' })}
                text={locales.entries.Lcz_Book}
              ></ir-button>
            </div>
            {showBookAndCheckin && (
              <div class="mt-1 mt-md-0 flex-fill">
                <ir-button
                  isLoading={this.isLoading === 'bookAndCheckIn'}
                  btn_styles="full-width align-items-center justify-content-center"
                  onClickHandler={() => this.buttonClicked.emit({ key: 'bookAndCheckIn' })}
                  text={locales.entries.Lcz_BookAndChekcIn}
                ></ir-button>
              </div>
            )}
          </div>
        )}
      </Host>
    );
  }
}
