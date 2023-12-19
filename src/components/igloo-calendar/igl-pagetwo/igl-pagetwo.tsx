import { Component, Prop, h, Event, EventEmitter, Host, State } from '@stencil/core';
import { IPageTwoDataUpdateProps } from '../../../models/models';
import { TPropertyButtonsTypes } from '../../../models/igl-book-property';
import { formatDate, getCurrencySymbol } from '../../../utils/utils';
@Component({
  tag: 'igl-pagetwo',
  styleUrl: 'igl-pagetwo.css',
  scoped: true,
})
export class IglPagetwo {
  @Prop() showPaymentDetails: boolean;
  @Prop() currency;
  @Prop() defaultTexts:any;
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
  @Event() dataUpdateEvent: EventEmitter<IPageTwoDataUpdateProps>;
  @Event() buttonClicked: EventEmitter<{
    key: TPropertyButtonsTypes;
    data?: CustomEvent;
  }>;
  @State() selectedBookedByData;
  @State() guestData: any;

  @State() selectedUnits: { [key: string]: any } = {};

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
      // const isCardDetails = ['cardNumber', 'cardHolderName', 'expiryMonth', 'expiryYear'].includes(key);
      // if (!this.showPaymentDetails && isCardDetails) {
      //   return false;
      // }
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
      // isValidProperty(this.selectedBookedByData, 'cardNumber', '') ||
      // isValidProperty(this.selectedBookedByData, 'cardHolderName', '') ||
      // isValidProperty(this.selectedBookedByData, 'expiryMonth', '') ||
      // isValidProperty(this.selectedBookedByData, 'expiryYear', '')
    );
  }

  render() {
    return (
      <Host>
        <div class="d-flex flex-wrap">
          <div class="flex-fill text-left p-0">
            <span class="mr-1 font-weight-bold font-medium-1">
              {formatDate(this.dateRangeData.fromDateStr)} - {formatDate(this.dateRangeData.toDateStr)}
            </span>
            {this.dateRangeData.dateDifference} {+this.dateRangeData.dateDifference > 1 ? 'nights' : 'night'}
          </div>
          {this.guestData.length > 1 && (
            <div class="mt-1 mt-md-0 text-right">
              Total price <span class="font-weight-bold font-medium-1">{getCurrencySymbol(this.currency.code) + this.bookingData.TOTAL_PRICE || '$0.00'}</span>
            </div>
          )}
        </div>

        {this.guestData.map((roomInfo, index) => {
          return (
            <igl-application-info
              currency={this.currency}
              bedPreferenceType={this.bedPreferenceType}
              index={index}
              selectedUnits={this.selectedUnits[`c_${roomInfo.roomCategoryId}`]}
              guestInfo={roomInfo}
              guestRefKey={index}
              bookingType={this.bookingData.event_type}
              roomsList={roomInfo.physicalRooms}
              onDataUpdateEvent={event => this.handleEventData(event, 'application-info', index)}
            ></igl-application-info>
          );
        })}

        {this.isEditOrAddRoomEvent || this.showSplitBookingOption ? null : (
          <igl-property-booked-by
            propertyId={this.propertyId}
            countryNodeList={this.countryNodeList}
            language={this.language}
            showPaymentDetails={this.showPaymentDetails}
            defaultData={this.bookedByInfoData}
            onDataUpdateEvent={event =>
              // this.dataUpdateEvent.emit({
              //   key: "propertyBookedBy",
              //   value: event.detail,
              // })
              this.handleEventData(event, 'propertyBookedBy', 0)
            }
          ></igl-property-booked-by>
        )}

        {this.isEditOrAddRoomEvent ? (
          <div class="d-flex p-0 mb-1 mt-2">
            <div class="flex-fill mr-2">
              <button type="button" class="btn btn-secondary full-width" onClick={() => this.buttonClicked.emit({ key: 'cancel' })}>
                Cancel
              </button>
            </div>
            <div class="flex-fill">
              <button
                disabled={this.isLoading === 'save' || this.isGuestDataIncomplete()}
                type="button"
                class="btn btn-primary full-width"
                onClick={() => this.buttonClicked.emit({ key: 'save' })}
              >
                {this.isLoading === 'save' && <i class="la la-circle-o-notch spinner mx-1"></i>}
                Save
              </button>
            </div>
          </div>
        ) : (
          <div class="d-flex flex-column flex-md-row p-0 mb-1 mt-2 justify-content-md-between align-items-md-center">
            <div class="flex-fill mr-md-1">
              <button type="button" class="btn btn-secondary full-width" onClick={() => this.buttonClicked.emit({ key: 'back' })}>
                <span class={'d-none d-md-inline-flex'}> &lt;&lt;</span> Back
              </button>
            </div>
            <div class="mt-1 mt-md-0 flex-fill mr-md-1">
              <button disabled={this.isButtonDisabled('book')} type="button" class="btn btn-primary full-width" onClick={() => this.buttonClicked.emit({ key: 'book' })}>
                {this.isLoading === 'book' && <i class="la la-circle-o-notch spinner mx-1"></i>}
                Book
              </button>
            </div>
            <div class="mt-1 mt-md-0 flex-fill">
              <button
                disabled={this.isButtonDisabled('bookAndCheckIn')}
                type="button"
                class="btn btn-primary full-width"
                onClick={() => this.buttonClicked.emit({ key: 'bookAndCheckIn' })}
              >
                {this.isLoading === 'bookAndCheckIn' && <i class="la la-circle-o-notch spinner mx-1"></i>}
                Book & check in
              </button>
            </div>
          </div>
        )}
      </Host>
    );
  }
}
