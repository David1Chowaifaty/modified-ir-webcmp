import { Component, Host, Prop, h, Event, EventEmitter } from '@stencil/core';
import { TAdultChildConstraints, TPropertyButtonsTypes, TSourceOption, TSourceOptions } from '../../../../models/igl-book-property';
import { IToast } from '../../../ir-toast/toast';
import moment from 'moment';

@Component({
  tag: 'igl-book-property-header',
  styleUrl: 'igl-book-property-header.css',
  scoped: true,
})
export class IglBookPropertyHeader {
  @Prop() splitBookingId: any = '';
  @Prop() bookingData: any = '';
  @Prop() minDate: string;
  @Prop() sourceOptions: TSourceOptions[] = [];
  @Prop() message: string;
  @Prop() bookingDataDefaultDateRange: { [key: string]: any };
  @Prop() showSplitBookingOption: boolean = false;
  @Prop() adultChildConstraints: TAdultChildConstraints;
  @Prop() splitBookings: any[];
  @Prop() adultChildCount: { adult: number; child: number };
  @Prop() dateRangeData: any;
  @Prop() defaultDaterange: { from_date: string; to_date: string };
  @Event() splitBookingDropDownChange: EventEmitter<any>;
  @Event() sourceDropDownChange: EventEmitter<string>;
  @Event() adultChild: EventEmitter<any>;
  @Event() checkClicked: EventEmitter<any>;
  @Event() buttonClicked: EventEmitter<{ key: TPropertyButtonsTypes }>;
  @Event() toast: EventEmitter<IToast>;
  private sourceOption: TSourceOption = {
    code: '',
    description: '',
    tag: '',
  };
  getSplitBookings() {
    return (this.bookingData.hasOwnProperty('splitBookingEvents') && this.bookingData.splitBookingEvents) || [];
  }
  getSelectedSplitBookingName(bookingId) {
    let splitBooking = this.splitBookings.find(booking => booking.ID === bookingId);
    return splitBooking.BOOKING_NUMBER + ' ' + splitBooking.NAME;
  }
  getSplitBookingList() {
    return (
      <fieldset class="form-group col-12 text-left">
        <label class="h5">To booking# </label>
        <div class="btn-group ml-1">
          <select class="form-control input-sm" id="xSmallSelect" onChange={evt => this.splitBookingDropDownChange.emit(evt)}>
            <option value="" selected={this.splitBookingId != ''}>
              Select
            </option>
            {this.splitBookings.map(option => (
              <option value={option.BOOKING_NUMBER} selected={this.splitBookingId === option.BOOKING_NUMBER}>
                {this.getSelectedSplitBookingName(option.ID)}
              </option>
            ))}
          </select>
        </div>
      </fieldset>
    );
  }
  getSourceNode() {
    return (
      <fieldset class="d-flex flex-column text-left flex-lg-row align-items-lg-center">
        <label class="h5 mr-lg-1">Source </label>
        <div class="btn-group mt-1 mt-lg-0 sourceContainer">
          <select class="form-control input-sm" id="xSmallSelect" onChange={evt => this.sourceDropDownChange.emit((evt.target as HTMLSelectElement).value)}>
            {this.sourceOptions.map(option => {
              if (option.type === 'LABEL') {
                return <optgroup label={option.value}></optgroup>;
              }
              return (
                <option value={option.id} selected={this.sourceOption.code === option.id}>
                  {option.value}
                </option>
              );
            })}
          </select>
        </div>
      </fieldset>
    );
  }
  handleAdultChildChange(key: string, event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    let obj = {};
    if (value === '') {
      obj = {
        ...this.adultChildCount,
        [key]: 0,
      };
    } else {
      obj = {
        ...this.adultChildCount,
        [key]: value,
      };
    }
    this.adultChild.emit(obj);
  }

  getAdultChildConstraints() {
    return (
      <div class={'mt-1 d-flex flex-column text-left'}>
        <label class="h5 d-lg-none">Number of Guests </label>
        <div class="form-group  text-left d-flex align-items-center justify-content-between justify-content-sm-start">
          <fieldset>
            <div class="btn-group ">
              <select class="form-control input-sm" id="xAdultSmallSelect" onChange={evt => this.handleAdultChildChange('adult', evt)}>
                <option value="">Ad..</option>
                {Array.from(Array(this.adultChildConstraints.adult_max_nbr), (_, i) => i + 1).map(option => (
                  <option value={option}>{option}</option>
                ))}
              </select>
            </div>
          </fieldset>
          {this.adultChildConstraints.child_max_nbr > 0 && (
            <fieldset class={'ml-1'}>
              <div class="btn-group ml-1">
                <select class="form-control input-sm" id="xChildrenSmallSelect" onChange={evt => this.handleAdultChildChange('child', evt)}>
                  <option value={''}>{`Ch... < ${this.adultChildConstraints.child_max_age} years`}</option>
                  {Array.from(Array(this.adultChildConstraints.child_max_nbr), (_, i) => i + 1).map(option => (
                    <option value={option}>{option}</option>
                  ))}
                </select>
              </div>
            </fieldset>
          )}
          <button class={'btn btn-primary btn-sm ml-2 '} onClick={() => this.handleButtonClicked()}>
            Check
          </button>
        </div>
      </div>
    );
  }
  handleButtonClicked() {
    if (this.minDate && new Date(this.dateRangeData.fromDate).getTime() > new Date(this.defaultDaterange.to_date).getTime()) {
      this.toast.emit({
        type: 'error',
        title: `Check-in date should be max ${moment(new Date(this.defaultDaterange.to_date)).format('ddd, DD MMM YYYY')} `,
        description: '',
        position: 'top-right',
      });
    } else if (this.adultChildCount.adult === 0) {
      this.toast.emit({ type: 'error', title: 'Please select the number of guests', description: '', position: 'top-right' });
    } else {
      this.buttonClicked.emit({ key: 'check' });
    }
  }
  isEventType(key: string) {
    return this.bookingData.event_type === key;
  }

  render() {
    return (
      <Host>
        {this.showSplitBookingOption ? this.getSplitBookingList() : this.isEventType('EDIT_BOOKING') || this.isEventType('ADD_ROOM') ? null : this.getSourceNode()}
        <div class={'d-lg-flex align-items-center'}>
          <fieldset class=" mt-1 mt-lg-0  ">
            <igl-date-range minDate={this.minDate} disabled={this.isEventType('BAR_BOOKING')} defaultData={this.bookingDataDefaultDateRange}></igl-date-range>
          </fieldset>
          {!this.isEventType('EDIT_BOOKING') && this.getAdultChildConstraints()}
        </div>
        <p class="text-left mt-1">{this.message}</p>
      </Host>
    );
  }
}
