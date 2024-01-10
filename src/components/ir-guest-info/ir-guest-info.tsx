import { Component, State, Event, EventEmitter, h, Prop, Watch, Listen } from '@stencil/core';
import { selectOption, guestInfo, guestInfoValidation } from '../../common/models';
import moment from 'moment';
import { Guest } from '../../models/booking.dto';

@Component({
  tag: 'ir-guest-info',
  styleUrl: 'ir-guest-info.css',
})
export class GuestInfo {
  @State() Model = new guestInfoValidation();
  @State() gotdata: boolean = false;
  @State() submit: boolean = false;
  @Event() submitForm: EventEmitter<guestInfo>;
  @Event() getSetupData: EventEmitter;
  @Prop({ mutable: true, reflect: true }) setupDataCountries: selectOption[] = null;
  @Prop({ mutable: true, reflect: true }) setupDataCountriesCode: selectOption[] = null;
  @Prop({ reflect: true, mutable: true }) data: Guest = null;
  @Prop() defaultTexts;

  componentWillLoad() {
    this.getSetupData.emit();
    this.submit = false;
    if (this.data !== null) {
      this.Model = { ...this.Model, ...this.data };
      this.Model.firstNameValid = this.data.first_name.trim() !== '' && this.data.first_name !== null ? true : false;
      this.Model.lastNameValid = this.data.last_name.trim() !== '' && this.data.last_name !== null ? true : false;
      this.Model.emailValid = this.data.email.trim() !== '' && this.data.email !== null ? true : false;
      this.Model.countryValid = this.data.country_id !== null ? true : false;
      //this.Model.passwordValid = this.data.password.trim() !== '' && this.data.password !== null ? true : false;
      this.Model.passwordValid = true;
    } else {
      this.Model = new guestInfoValidation();
    }
  }

  @Watch('data')
  watchHandler() {
    console.log('The new value of data is: ', this.data);
    this.submit = false;
    if (this.data !== null) {
      this.Model = { ...this.Model, ...this.data };
      this.Model.firstNameValid = this.data.first_name.trim() !== '' && this.data.first_name !== null ? true : false;
      this.Model.lastNameValid = this.data.last_name.trim() !== '' && this.data.last_name !== null ? true : false;
      this.Model.emailValid = this.data.email.trim() !== '' && this.data.email !== null ? true : false;
      this.Model.countryValid = this.data.last_name !== null ? true : false;
      this.Model.passwordValid = true;
      //this.Model.passwordValid = this.data.password.trim() !== '' && this.data.password !== null ? true : false;
    } else {
      this.Model = new guestInfoValidation();
    }
  }

  @Listen('textChange')
  @Listen('checkboxChange')
  @Listen('selectChange')
  handleInputChange(event) {
    this.submit = false;
    const target = event.target;
    const name = target.name;
    if (target.required !== undefined) {
      const nameValid = `${name}Valid`;
      if (name === 'country') {
        this.Model[name] = parseInt(event.detail);
      }
      this.Model[name] = event.detail;
      this.Model[nameValid] = event.detail !== -1 || (event.detail.trim() !== '' && event.detail !== null) ? true : false;
    } else {
      this.Model[name] = event.detail;
    }
  }

  @Listen('clickHanlder')
  handleSubmit(e) {
    e.preventDefault();
    this.submit = true;
    if (this.Model.firstNameValid && this.Model.lastNameValid && this.Model.emailValid && this.Model.countryValid && this.Model.passwordValid) {
      //let data: guestInfo = { ...this.Model };
      //this.submitForm.emit(data);
    }
  }

  render() {
    let countries = null;
    let countryPrefix = null;
    if (this.setupDataCountries !== null && this.setupDataCountriesCode !== null) {
      countries = (
        <ir-select
          required
          name="country"
          submited={this.submit}
          label={'Country'}
          selectedValue={this.Model.country_id.toString()}
          data={this.setupDataCountries.map(item => {
            return {
              value: item.value.toString(),
              text: item.text,
            };
          })}
          firstOption={'...'}
        ></ir-select>
      );

      countryPrefix = (
        <ir-select
          name="prefix"
          label={'Mobile'}
          submited={this.submit}
          //selectedValue={this.Model.prefix}
          data={this.setupDataCountriesCode.map(item => {
            return {
              value: item.value.toString(),
              text: item.text,
            };
          })}
          firstOption={'...'}
          selectStyle={false}
          required
        ></ir-select>
      );
    }

    return [
      <h3>
        <strong>Guest Details</strong>
      </h3>,
      <div class="card">
        <div class="card-header">
          <h4 class="card-title">
            Registration date : <strong>{moment().format('DD-MMM-YYYY')}</strong>
          </h4>
        </div>
        <div class="card-content collapse show">
          <div class="card-body pt-0">
            <ir-input-text placeholder="" label={`${this.defaultTexts.entries.Lcz_FirstName}:`} name="firstName" submited={this.submit} value={this.Model.first_name} required></ir-input-text>
            <ir-input-text placeholder="" label={`${this.defaultTexts.entries.Lcz_LastName}:`} name="lastName" submited={this.submit} value={this.Model.last_name} required></ir-input-text>
            <ir-input-text placeholder="" label="Email" name="email" submited={this.submit} value={this.Model.email} required></ir-input-text>
            <ir-input-text placeholder="" label="Alternative email" name="altEmail" value={this.Model.email}></ir-input-text>
            {/* <ir-input-text label="Password" placeholder="" name="password" submited={this.submit} type="password" value={this.Model.password} required></ir-input-text> */}
            {countries}
            <ir-input-text placeholder="" label="City" name="city" value={this.Model.city}></ir-input-text>
            <ir-input-text placeholder="" label="Address" name="address" value={this.Model.address}></ir-input-text>
            {countryPrefix}
            <ir-input-text put-text LabelAvailable={false} name="mobile" placeholder="" submited={this.submit} value={this.Model.mobile} required></ir-input-text>
            <ir-checkbox label="NewsLetter" name="newsletter" checked={this.Model.subscribe_to_news_letter}></ir-checkbox>
            <p>
              <strong>Last used:</strong> Language:
              {/* <strong>{this.Model.language}</strong> --- Currency: <strong>{this.Model.currency}</strong> */}
            </p>
            <hr />
            <ir-button text={this.defaultTexts.entries.Lcz_Save} color="btn-primary"></ir-button>
          </div>
        </div>
      </div>,
    ];
  }
}
