import { Component, Host, Prop, h, Event, EventEmitter } from '@stencil/core';
import { TAdultChildConstraints, TPropertyButtonsTypes, TSourceOption, TSourceOptions } from '../../../../models/igl-book-property';
import { IToast } from '../../../ir-toast/toast';
import moment from 'moment';
import { Languages } from '../../../../redux/features/languages';

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
  @Prop() bookedByInfoData: any;
  @Prop() defaultDaterange: { from_date: string; to_date: string };
  @Prop() propertyId: number;
  @Prop() defaultTexts: Languages;
  @Event() splitBookingDropDownChange: EventEmitter<any>;
  @Event() sourceDropDownChange: EventEmitter<string>;
  @Event() adultChild: EventEmitter<any>;
  @Event() checkClicked: EventEmitter<any>;
  @Event() buttonClicked: EventEmitter<{ key: TPropertyButtonsTypes }>;
  @Event() toast: EventEmitter<IToast>;
  @Event() spiltBookingSelected: EventEmitter<{ key: string; data: unknown }>;
  private sourceOption: TSourceOption = {
    code: '',
    description: '',
    tag: '',
  };

  getSplitBookingList() {
    return (
      <fieldset class="form-group  text-left">
        <label class="h5">{this.defaultTexts.entries.Lcz_Tobooking}# </label>
        <div class="btn-group ml-1">
          <ir-autocomplete
            value={
              Object.keys(this.bookedByInfoData).length > 1 ? `${this.bookedByInfoData.bookingNumber} ${this.bookedByInfoData.firstName} ${this.bookedByInfoData.lastName}` : ''
            }
            from_date={moment(this.bookingDataDefaultDateRange.fromDate).format('YYYY-MM-DD')}
            to_date={moment(this.bookingDataDefaultDateRange.toDate).format('YYYY-MM-DD')}
            propertyId={this.propertyId}
            placeholder={this.defaultTexts.entries.Lcz_BookingNumber}
            onComboboxValue={e => {
              e.stopImmediatePropagation();
              e.stopPropagation;
              this.spiltBookingSelected.emit(e.detail);
            }}
            isSplitBooking
          ></ir-autocomplete>
        </div>
      </fieldset>
    );
  }
  getSourceNode() {
    return (
      <fieldset class="d-flex flex-column text-left flex-lg-row align-items-lg-center">
        <label class="h5 mr-lg-1">{this.defaultTexts.entries.Lcz_Source} </label>
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
        <label class="h5 d-lg-none">{this.defaultTexts.entries.Lcz_NumberOfGuests} </label>
        <div class="form-group  text-left d-flex align-items-center justify-content-between justify-content-sm-start">
          <fieldset>
            <div class="btn-group ">
              <select class="form-control input-sm" id="xAdultSmallSelect" onChange={evt => this.handleAdultChildChange('adult', evt)}>
                <option value="">{this.defaultTexts.entries.Lcz_AdultsCaption}</option>
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
                  <option value={''}>{this.renderChildCaption()}</option>
                  {Array.from(Array(this.adultChildConstraints.child_max_nbr), (_, i) => i + 1).map(option => (
                    <option value={option}>{option}</option>
                  ))}
                </select>
              </div>
            </fieldset>
          )}
          <button class={'btn btn-primary btn-sm ml-2 '} onClick={() => this.handleButtonClicked()}>
            {this.defaultTexts.entries.Lcz_Check}
          </button>
        </div>
      </div>
    );
  }
  renderChildCaption() {
    const maxAge = this.adultChildConstraints.child_max_age;
    let years = this.defaultTexts.entries.Lcz_Years;

    if (maxAge === 1) {
      years = this.defaultTexts.entries.Lcz_Year;
    }
    return `${this.defaultTexts.entries.Lcz_ChildCaption} < ${this.adultChildConstraints.child_max_age} ${years}`;
  }
  handleButtonClicked() {
    console.log(this.isEventType('SPLIT_BOOKING') && Object.keys(this.bookedByInfoData).length === 1);
    if (this.isEventType('SPLIT_BOOKING') && Object.keys(this.bookedByInfoData).length <= 1) {
      this.toast.emit({
        type: 'error',
        title: this.defaultTexts.entries.Lcz_ChooseBookingNumber,
        description: '',
        position: 'top-right',
      });
    } else if (this.minDate && new Date(this.dateRangeData.fromDate).getTime() > new Date(this.bookedByInfoData.to_date || this.defaultDaterange.to_date).getTime()) {
      this.toast.emit({
        type: 'error',
        title: `${this.defaultTexts.entries.Lcz_CheckInDateShouldBeMAx} ${moment(new Date(this.bookedByInfoData.to_date || this.defaultDaterange.to_date)).format(
          'ddd, DD MMM YYYY',
        )} `,
        description: '',
        position: 'top-right',
      });
    } else if (this.adultChildCount.adult === 0) {
      this.toast.emit({ type: 'error', title: this.defaultTexts.entries.Lcz_PlzSelectNumberOfGuests, description: '', position: 'top-right' });
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
            <igl-date-range
              dateLabel={this.defaultTexts.entries.Lcz_Dates}
              minDate={this.minDate}
              disabled={this.isEventType('BAR_BOOKING') || this.isEventType('SPLIT_BOOKING')}
              defaultData={this.bookingDataDefaultDateRange}
            ></igl-date-range>
          </fieldset>
          {!this.isEventType('EDIT_BOOKING') && this.getAdultChildConstraints()}
        </div>
        <p class="text-left mt-1">{this.message}</p>
      </Host>
    );
  }
}
