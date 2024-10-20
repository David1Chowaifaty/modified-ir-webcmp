import { THKUser } from '@/models/housekeeping';
import { HouseKeepingService } from '@/services/housekeeping.service';
import calendar_data from '@/stores/calendar-data';
import { getDefaultProperties } from '@/stores/housekeeping.store';
import locales from '@/stores/locales.store';
import { ValidationRule, validateForm } from '@/utils/validation';
import { Component, Host, Prop, State, h, Event, EventEmitter } from '@stencil/core';

@Component({
  tag: 'ir-hk-user',
  styleUrl: 'ir-hk-user.css',
  scoped: true,
})
export class IrHkUser {
  @Prop() user: THKUser | null = null;
  @Prop() isEdit: boolean = false;

  @State() isLoading: boolean = false;
  @State() userInfo: THKUser = {
    id: -1,
    mobile: '',
    name: '',
    note: '',
    password: '',
    property_id: null,
    username: null,
    phone_prefix: null,
  };

  @State() errors: { [P in keyof THKUser]?: any } | null = null;

  @Event() resetData: EventEmitter<null>;
  @Event() closeSideBar: EventEmitter<null>;

  private housekeepingService = new HouseKeepingService();
  private default_properties = {
    token: '',
    language: '',
  };

  async componentWillLoad() {
    const { token, language, property_id } = getDefaultProperties();
    this.default_properties = { token, language };
    if (!this.user) {
      this.userInfo['property_id'] = property_id;
    }
    if (this.user) {
      this.userInfo = { ...this.user };
    }
    console.log(this.userInfo);
  }

  updateUserField(key: keyof THKUser, value: any) {
    this.userInfo = { ...this.userInfo, [key]: value };
  }

  async addUser() {
    try {
      this.isLoading = true;
      const validationRules: { [P in keyof THKUser]?: ValidationRule } = {
        name: { required: true },
        mobile: { required: true },
        password: { required: true, minLength: 5 },
      };
      const validationResult = validateForm(this.userInfo, validationRules);
      if (!validationResult.isValid) {
        this.errors = validationResult.errors;
        return;
      }
      if (this.errors) {
        this.errors = null;
      }
      await this.housekeepingService.editExposedHKM(this.userInfo);
      this.resetData.emit(null);
      this.closeSideBar.emit(null);
    } catch (error) {
      console.error(error);
    } finally {
      this.isLoading = false;
    }
  }
  async handleBlur(e: CustomEvent) {
    e.stopImmediatePropagation();
    e.stopPropagation();
    if (this.user || !this.userInfo.name) {
      return;
    }
    const usermame = await this.housekeepingService.generateUserName(this.userInfo.name);
    this.updateUserField('username', usermame);
  }

  render() {
    return (
      <Host>
        <ir-title class="px-1" displayContext="sidebar" label={this.isEdit ? locales.entries.Lcz_EditHousekeeperProfile : locales.entries.Lcz_CreateHousekeeperProfile}></ir-title>
        <section class="px-1">
          <ir-input-text
            error={this.errors?.name?.length > 0}
            label={locales.entries.Lcz_Name}
            placeholder={locales.entries.Lcz_Name}
            onTextChange={e => this.updateUserField('name', e.detail)}
            value={this.userInfo.name}
            onInputBlur={this.handleBlur.bind(this)}
          ></ir-input-text>
          <ir-phone-input
            placeholder={locales.entries.Lcz_Mobile}
            error={this.errors?.mobile?.length > 0}
            language={this.default_properties.language}
            token={this.default_properties.token}
            default_country={calendar_data.country.id}
            phone_prefix={this.user?.phone_prefix}
            label={locales.entries.Lcz_Mobile}
            value={this.userInfo.mobile}
            onTextChange={e => {
              this.updateUserField('phone_prefix', e.detail.phone_prefix);
              this.updateUserField('mobile', e.detail.mobile);
            }}
          ></ir-phone-input>

          <ir-input-text
            disabled={this.user !== null}
            label={locales.entries.Lcz_Username}
            placeholder={locales.entries.Lcz_Username}
            value={this.userInfo.username}
            onTextChange={e => this.updateUserField('username', e.detail)}
          ></ir-input-text>

          <ir-input-text
            label={locales.entries.Lcz_Password}
            placeholder={locales.entries.Lcz_MinimumCharacter}
            value={this.userInfo.password}
            type="password"
            error={this.errors?.password?.length > 0}
            onTextChange={e => this.updateUserField('password', e.detail)}
          ></ir-input-text>
          <ir-input-text
            label={locales.entries.Lcz_Note}
            placeholder={locales.entries.Lcz_Note}
            value={this.userInfo.note}
            onTextChange={e => this.updateUserField('note', e.detail)}
          ></ir-input-text>
          <div class="d-flex flex-column flex-md-row align-items-md-center mt-2 w-100">
            <ir-button
              onClickHanlder={() => this.closeSideBar.emit(null)}
              class="flex-fill"
              btn_styles="w-100  justify-content-center align-items-center"
              btn_color="secondary"
              text={locales.entries.Lcz_Cancel}
            ></ir-button>
            <ir-button
              isLoading={this.isLoading}
              onClickHanlder={this.addUser.bind(this)}
              class="flex-fill ml-md-1"
              btn_styles="w-100  justify-content-center align-items-center mt-1 mt-md-0"
              text={locales.entries.Lcz_Save}
            ></ir-button>
          </div>
        </section>
      </Host>
    );
  }
}
