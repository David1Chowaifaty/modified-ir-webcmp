import { Component, State, h, Prop } from '@stencil/core';
import { selectOption } from '@/common/models';
import { Guest } from '@/models/booking.dto';
import { BookingService } from '@/services/booking.service';
import { ICountry, Languages } from '@/components';

@Component({
  tag: 'ir-guest-info',
  styleUrl: 'ir-guest-info.css',
})
export class GuestInfo {
  @Prop({ mutable: true, reflect: true }) setupDataCountries: selectOption[] = null;
  @Prop({ mutable: true, reflect: true }) setupDataCountriesCode: selectOption[] = null;
  @Prop() defaultTexts: Languages;
  @Prop() language: string;
  @Prop() email: string;

  @State() countries: ICountry[];
  @State() submit: boolean = false;
  @State() guest: Guest | null = null;
  @State() isLoading: boolean = false;

  private bookingService = new BookingService();

  async componentWillLoad() {
    await this.init();
  }
  async init() {
    try {
      const [guest, countries] = await Promise.all([this.bookingService.fetchGuest(this.email), this.bookingService.getCountries(this.language)]);
      this.countries = countries;
      this.guest = guest;
    } catch (error) {
      console.log(error);
    }
  }
  handleInputChange(key: keyof Guest, value: any) {
    this.guest = { ...this.guest, [key]: value };
  }

  async editGuest() {
    try {
      this.isLoading = true;
      await this.bookingService.editExposedGuest(this.guest);
    } catch (error) {
      console.log(error);
    } finally {
      this.isLoading = false;
      console.log('done');
    }
  }
  render() {
   
    if (!this.guest) {
      return null;
    }
    return [
      <h3>
        <strong>Guest Details</strong>
      </h3>,
      <div class="card">
        <div class="card-content collapse show">
          <div class="card-body pt-0">
            <ir-input-text
              placeholder=""
              label={`${this.defaultTexts.entries.Lcz_FirstName}:`}
              name="firstName"
              submited={this.submit}
              value={this.guest.first_name}
              required
              onTextChange={e => this.handleInputChange('first_name', e.detail)}
            ></ir-input-text>
            <ir-input-text
              placeholder=""
              label={`${this.defaultTexts.entries.Lcz_LastName}:`}
              name="lastName"
              submited={this.submit}
              value={this.guest.last_name}
              required
              onTextChange={e => this.handleInputChange('last_name', e.detail)}
            ></ir-input-text>
            <ir-input-text
              placeholder=""
              label="Email"
              name="email"
              submited={this.submit}
              value={this.guest.email}
              required
              onTextChange={e => this.handleInputChange('email', e.detail)}
            ></ir-input-text>
            <ir-input-text
              placeholder=""
              label="Alternative email"
              name="altEmail"
              value={this.guest.email}
              onTextChange={e => this.handleInputChange('email', e.detail)}
            ></ir-input-text>
            {/* <ir-input-text label="Password" placeholder="" name="password" submited={this.submit} type="password" value={this.Model.password} required></ir-input-text> */}
            <ir-select
              required
              name="country"
              submited={this.submit}
              label={'Country'}
              selectedValue={this.guest.country_id.toString()}
              data={this.countries.map(item => {
                return {
                  value: item.id.toString(),
                  text: item.name,
                };
              })}
              firstOption={'...'}
              onSelectChange={e => this.handleInputChange('country_id', e.detail)}
            ></ir-select>
            <ir-input-text placeholder="" label="City" name="city" value={this.guest.city} onTextChange={e => this.handleInputChange('city', e.detail)}></ir-input-text>
            <ir-input-text placeholder="" label="Address" name="address" value={this.guest.address} onTextChange={e => this.handleInputChange('address', e.detail)}></ir-input-text>

            <div class="form-group mr-0">
              <div class="input-group row m-0 p-0">
                <div class={`input-group-prepend col-3 p-0 text-dark border-none`}>
                  <label class={`input-group-text  bg-light flex-grow-1 text-dark border-0 `}>
                    {'mobile'}
                    {'*'}
                  </label>
                </div>
                <select
                  class={` form-control text-md  col-2 py-0 mobilePrefixSelect`}
                  onInput={e => this.handleInputChange('country_id', (e.target as HTMLSelectElement).value)}
                  required
                >
                  <option value={null}>...</option>
                  {this.countries.map(item => (
                    <option selected={this.guest.country_id.toString() === item.id.toString()} value={item.id}>
                      {item.phone_prefix}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  required
                  value={this.guest.mobile}
                  class={'form-control flex-fill mobilePrefixInput'}
                  onInput={e => this.handleInputChange('mobile', (e.target as HTMLInputElement).value)}
                />
              </div>
            </div>
            <div class={'col-3 p-0'}>
              <ir-checkbox
                onCheckboxChange={e => this.handleInputChange('subscribe_to_news_letter', e.detail.checked)}
                label="NewsLetter"
                name="newsletter"
                checked={this.guest.subscribe_to_news_letter}
              ></ir-checkbox>
            </div>
            <hr />
            <ir-button text={this.defaultTexts.entries.Lcz_Save} onClickHanlder={this.editGuest.bind(this)} color="btn-primary"></ir-button>
          </div>
        </div>
      </div>,
    ];
  }
}
