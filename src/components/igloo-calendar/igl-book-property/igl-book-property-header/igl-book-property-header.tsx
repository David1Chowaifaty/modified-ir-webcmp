import { Component, Host, Prop, h, Event, EventEmitter } from '@stencil/core';
import { TAdultChildConstraints, TPropertyButtonsTypes, TSourceOption, TSourceOptions } from '../../../../models/igl-book-property';

@Component({
  tag: 'igl-book-property-header',
  styleUrl: 'igl-book-property-header.css',
  scoped: true,
})
export class IglBookPropertyHeader {
  @Prop() splitBookingId: any = '';
  @Prop() bookingData: any = '';
  @Prop() sourceOptions: TSourceOptions[] = [];
  @Prop() message: string;
  @Prop() bookingDataDefaultDateRange: { [key: string]: any };
  @Prop() showSplitBookingOption: boolean = false;
  @Prop() adultChildConstraints: TAdultChildConstraints;
  @Prop() splitBookings: any[];
  @Prop() adultChildCount: { adult: number; child: number };
  @Event() splitBookingDropDownChange: EventEmitter<any>;
  @Event() sourceDropDownChange: EventEmitter<string>;
  @Event() adultChild: EventEmitter<any>;
  @Event() checkClicked: EventEmitter<any>;
  @Event() buttonClicked: EventEmitter<{ key: TPropertyButtonsTypes }>;
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
    return splitBooking.ID + ' ' + splitBooking.NAME;
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
              <option value={option.ID} selected={this.splitBookingId === option.ID}>
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
      <fieldset class="col-12 text-left">
        <label class="h5">Source </label>
        <div class="btn-group ml-1">
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
      <div class="form-group  text-left d-flex align-items-center mt-1">
        <fieldset>
          <div class="btn-group ml-1">
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
        <button disabled={this.adultChildCount.adult === 0} class={'btn btn-primary btn-sm ml-2 '} onClick={() => this.buttonClicked.emit({ key: 'check' })}>
          Check
        </button>
      </div>
    );
  }

  isEventType(key: string) {
    return this.bookingData.event_type === key;
  }

  render() {
    return (
      <Host>
        {this.showSplitBookingOption ? this.getSplitBookingList() : this.isEventType('EDIT_BOOKING') || this.isEventType('ADD_ROOM') ? null : this.getSourceNode()}
        <div class={'d-md-flex align-items-center'}>
          <fieldset class="form-group row mt-1 mt-md-0  ">
            <igl-date-range disabled={this.isEventType('BAR_BOOKING')} defaultData={this.bookingDataDefaultDateRange}></igl-date-range>
          </fieldset>
          {!this.isEventType('EDIT_BOOKING') && this.getAdultChildConstraints()}
        </div>
        <p class="text-left ml-1 mt-1">{this.message}</p>
      </Host>
    );
  }
}
