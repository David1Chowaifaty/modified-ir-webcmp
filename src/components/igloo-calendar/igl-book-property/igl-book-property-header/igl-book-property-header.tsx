import { Component, Host, Prop, h, Event, EventEmitter } from '@stencil/core';
import { TAdultChildConstraints, TPropertyButtonsTypes, TSourceOption, TSourceOptions } from '../../../../models/igl-book-property';
import { IToast } from '../../../ir-toast/toast';
import moment from 'moment';
import locales from '@/stores/locales.store';
import interceptor_requests from '@/stores/ir-interceptor.store';

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
        <label class="h5">{locales.entries.Lcz_Tobooking}# </label>
        <div class="btn-group ml-1">
          <ir-autocomplete
            value={
              Object.keys(this.bookedByInfoData).length > 1 ? `${this.bookedByInfoData.bookingNumber} ${this.bookedByInfoData.firstName} ${this.bookedByInfoData.lastName}` : ''
            }
            from_date={moment(this.bookingDataDefaultDateRange.fromDate).format('YYYY-MM-DD')}
            to_date={moment(this.bookingDataDefaultDateRange.toDate).format('YYYY-MM-DD')}
            propertyId={this.propertyId}
            placeholder={locales.entries.Lcz_BookingNumber}
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
        <label class="mr-lg-1">{locales.entries.Lcz_Source} </label>
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
      <div class={'mt-1 mt-lg-0 d-flex flex-column text-left'}>
        <label class="mb-1 d-lg-none">{locales.entries.Lcz_NumberOfGuests} </label>
        <div class="form-group my-lg-0 text-left d-flex align-items-center justify-content-between justify-content-sm-start">
          <fieldset>
            <div class="btn-group ">
              <select class="form-control input-sm" id="xAdultSmallSelect" onChange={evt => this.handleAdultChildChange('adult', evt)}>
                <option value="">{locales.entries.Lcz_AdultsCaption}</option>
                {Array.from(Array(this.adultChildConstraints.adult_max_nbr), (_, i) => i + 1).map(option => (
                  <option value={option}>{option}</option>
                ))}
              </select>
            </div>
          </fieldset>
          {this.adultChildConstraints.child_max_nbr > 0 && (
            <fieldset>
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
          <ir-button
            isLoading={interceptor_requests.status === 'pending'}
            icon=""
            size="sm"
            class="ml-2"
            text={locales.entries.Lcz_Check}
            onClickHanlder={() => this.handleButtonClicked()}
          ></ir-button>
          {/* <button class={'btn btn-primary btn-sm  ml-2'} onClick={() => this.handleButtonClicked()}>
            {locales.entries.Lcz_Check}
          </button> */}
        </div>
      </div>
    );
  }
  renderChildCaption() {
    const maxAge = this.adultChildConstraints.child_max_age;
    let years = locales.entries.Lcz_Years;

    if (maxAge === 1) {
      years = locales.entries.Lcz_Year;
    }
    return `${locales.entries.Lcz_ChildCaption} < ${this.adultChildConstraints.child_max_age} ${years}`;
  }
  handleButtonClicked() {
    if (this.isEventType('SPLIT_BOOKING') && Object.keys(this.bookedByInfoData).length <= 1) {
      this.toast.emit({
        type: 'error',
        title: locales.entries.Lcz_ChooseBookingNumber,
        description: '',
        position: 'top-right',
      });
    } else if (this.isEventType('ADD_ROOM') || this.isEventType('SPLIT_BOOKING')) {
      const initialToDate = moment(new Date(this.bookedByInfoData.to_date || this.defaultDaterange.to_date));
      const initialFromDate = moment(new Date(this.bookedByInfoData.from_date || this.defaultDaterange.from_date));
      const selectedFromDate = moment(new Date(this.dateRangeData.fromDate));
      const selectedToDate = moment(new Date(this.dateRangeData.toDate));
      if (selectedToDate.isBefore(initialFromDate) || selectedFromDate.isAfter(initialToDate)) {
        this.toast.emit({
          type: 'error',
          title: `${locales.entries.Lcz_CheckInDateShouldBeMAx.replace(
            '%1',
            moment(new Date(this.bookedByInfoData.from_date || this.defaultDaterange.from_date)).format('ddd, DD MMM YYYY'),
          ).replace('%2', moment(new Date(this.bookedByInfoData.to_date || this.defaultDaterange.to_date)).format('ddd, DD MMM YYYY'))}  `,
          description: '',
          position: 'top-right',
        });
        return;
      } else if (this.adultChildCount.adult === 0) {
        this.toast.emit({ type: 'error', title: locales.entries.Lcz_PlzSelectNumberOfGuests, description: '', position: 'top-right' });
      } else {
        this.buttonClicked.emit({ key: 'check' });
      }
    } else if (this.minDate && new Date(this.dateRangeData.fromDate).getTime() > new Date(this.bookedByInfoData.to_date || this.defaultDaterange.to_date).getTime()) {
      this.toast.emit({
        type: 'error',
        title: `${locales.entries.Lcz_CheckInDateShouldBeMAx.replace(
          '%1',
          moment(new Date(this.bookedByInfoData.from_date || this.defaultDaterange.from_date)).format('ddd, DD MMM YYYY'),
        ).replace('%2', moment(new Date(this.bookedByInfoData.to_date || this.defaultDaterange.to_date)).format('ddd, DD MMM YYYY'))}  `,
        description: '',
        position: 'top-right',
      });
    } else if (this.adultChildCount.adult === 0) {
      this.toast.emit({ type: 'error', title: locales.entries.Lcz_PlzSelectNumberOfGuests, description: '', position: 'top-right' });
    } else {
      this.buttonClicked.emit({ key: 'check' });
    }
  }
  isEventType(key: string) {
    return this.bookingData.event_type === key;
  }

  render() {
    const showSourceNode = this.showSplitBookingOption ? this.getSplitBookingList() : this.isEventType('EDIT_BOOKING') || this.isEventType('ADD_ROOM') ? false : true;
    return (
      <Host>
        {showSourceNode && this.getSourceNode()}
        <div class={`d-flex flex-column flex-lg-row align-items-lg-center ${showSourceNode ? 'mt-1' : ''}`}>
          <fieldset class="mt-lg-0  ">
            <igl-date-range
              dateLabel={locales.entries.Lcz_Dates}
              minDate={this.minDate}
              disabled={this.isEventType('BAR_BOOKING') || this.isEventType('SPLIT_BOOKING')}
              defaultData={this.bookingDataDefaultDateRange}
            ></igl-date-range>
          </fieldset>
          {!this.isEventType('EDIT_BOOKING') && this.getAdultChildConstraints()}
        </div>
        <p class="text-right mt-1 message-label">{this.message}</p>
      </Host>
    );
  }
}
