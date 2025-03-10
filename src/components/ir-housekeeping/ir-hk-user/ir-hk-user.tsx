import { THKUser } from '@/models/housekeeping';
import { HouseKeepingService } from '@/services/housekeeping.service';
import { UserService } from '@/services/user.service';
import calendar_data from '@/stores/calendar-data';
import { getDefaultProperties } from '@/stores/housekeeping.store';
import locales from '@/stores/locales.store';
import { Component, Host, Prop, State, h, Event, EventEmitter } from '@stencil/core';
import { z, ZodError } from 'zod';

@Component({
  tag: 'ir-hk-user',
  styleUrl: 'ir-hk-user.css',
  scoped: true,
})
export class IrHkUser {
  @Prop() user: THKUser | null = null;
  @Prop() isEdit: boolean = false;

  @State() isLoading: boolean = false;
  @State() autoValidate = false;

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
  @State() showPasswordValidation: boolean = false;
  @State() isUsernameTaken: boolean;

  @Event() resetData: EventEmitter<null>;
  @Event() closeSideBar: EventEmitter<null>;

  private housekeepingService = new HouseKeepingService();
  private default_properties = {
    token: '',
    language: '',
  };
  private housekeeperSchema = z.object({
    name: z.string().min(2),
    mobile: z.string().min(1).max(14),
    password: z.string().regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()\-_=+]).{8,16}$/),
    username: z
      .string()
      .min(3)
      .refine(
        async name => {
          if (name.length >= 3) {
            return !(await new UserService().checkUserExistence({ UserName: name }));
          }
          return true;
        },
        { message: 'Username already exists.' },
      ),
  });

  async componentWillLoad() {
    const { token, language, property_id } = getDefaultProperties();
    this.default_properties = { token, language };
    if (!this.user) {
      this.userInfo['property_id'] = property_id;
      this.showPasswordValidation = true;
    }
    if (this.user) {
      this.userInfo = { ...this.user, password: '' };
    }
  }

  updateUserField(key: keyof THKUser, value: any) {
    this.userInfo = { ...this.userInfo, [key]: value };
  }

  async addUser() {
    try {
      this.isLoading = true;
      this.autoValidate = true;
      const toValidateUserInfo = { ...this.userInfo, password: this.user && this.userInfo.password === '' ? this.user.password : this.userInfo.password };
      console.log('toValidateUserInfo', toValidateUserInfo);
      await this.housekeeperSchema.parseAsync(toValidateUserInfo);
      if (this.errors) {
        this.errors = null;
      }
      await this.housekeepingService.editExposedHKM(toValidateUserInfo);
      this.resetData.emit(null);
      this.closeSideBar.emit(null);
    } catch (error) {
      const e: any = {};
      if (error instanceof ZodError) {
        error.issues.map(err => {
          e[err.path[0]] = true;
        });
        this.errors = e;
      }
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
            zod={this.housekeeperSchema.pick({ name: true })}
            wrapKey="name"
            autoValidate={this.autoValidate}
            error={this.errors?.name && !this.userInfo?.name}
            label={locales.entries.Lcz_Name}
            placeholder={locales.entries.Lcz_Name}
            onTextChange={e => this.updateUserField('name', e.detail)}
            value={this.userInfo.name}
            onInputBlur={this.handleBlur.bind(this)}
            maxLength={40}
          ></ir-input-text>
          <ir-phone-input
            placeholder={locales.entries.Lcz_Mobile}
            error={this.errors?.mobile && !this.userInfo?.mobile}
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

          {/* <ir-input-text
            label={locales.entries.Lcz_Note}
            placeholder={locales.entries.Lcz_Note}
            value={this.userInfo.note}
            onTextChange={e => this.updateUserField('note', e.detail)}
            ></ir-input-text> */}
          <div class="mb-1">
            <ir-textarea
              variant="prepend"
              maxLength={250}
              label={locales.entries.Lcz_Note}
              placeholder={locales.entries.Lcz_Note}
              value={this.userInfo.note}
              onTextChange={e => this.updateUserField('note', e.detail)}
            ></ir-textarea>
          </div>
          <ir-input-text
            zod={this.housekeeperSchema.pick({ username: true })}
            wrapKey="username"
            error={this.errors?.username}
            asyncParse
            autoValidate={this.autoValidate}
            // disabled={this.user !== null}
            errorMessage={this.errors?.username && this.userInfo.username.length >= 3 ? 'Username already exists.' : undefined}
            label={locales.entries.Lcz_Username}
            placeholder={locales.entries.Lcz_Username}
            value={this.userInfo.username}
            onTextChange={e => this.updateUserField('username', e.detail)}
          ></ir-input-text>
          <ir-input-text
            autoValidate={this.autoValidate}
            label={locales.entries.Lcz_Password}
            value={this.userInfo.password}
            type="password"
            maxLength={16}
            zod={this.housekeeperSchema.pick({ password: true })}
            wrapKey="password"
            error={this.errors?.password && !this.userInfo.password}
            onInputFocus={() => (this.showPasswordValidation = true)}
            onInputBlur={() => {
              if (this.user) this.showPasswordValidation = false;
            }}
            onTextChange={e => this.updateUserField('password', e.detail)}
          ></ir-input-text>
          {this.showPasswordValidation && <ir-password-validator password={this.userInfo.password}></ir-password-validator>}
          <div class="d-flex flex-column flex-md-row align-items-md-center mt-2 w-100">
            <ir-button
              onClickHandler={() => this.closeSideBar.emit(null)}
              class="flex-fill"
              btn_styles="w-100  justify-content-center align-items-center"
              btn_color="secondary"
              text={locales.entries.Lcz_Cancel}
            ></ir-button>
            <ir-button
              isLoading={this.isLoading}
              onClickHandler={this.addUser.bind(this)}
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
