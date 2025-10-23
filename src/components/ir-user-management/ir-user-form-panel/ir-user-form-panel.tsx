import { Component, Event, EventEmitter, Fragment, Prop, State, h } from '@stencil/core';

import locales from '@/stores/locales.store';
import { z, ZodError } from 'zod';
import { HouseKeepingService } from '@/services/housekeeping.service';
import { CONSTANTS } from '@/utils/constants';
import { UserService } from '@/services/user.service';
import calendar_data from '@/stores/calendar-data';
import { User } from '@/models/Users';
import { _formatTime } from '@/components/ir-booking-details/functions';
import moment from 'moment';
import { UAParser } from 'ua-parser-js';
import { AllowedUser } from '../types';
import { InterceptorError } from '@/components/ir-interceptor/InterceptorError';
import Token from '@/models/Token';

@Component({
  tag: 'ir-user-form-panel',
  styleUrls: ['ir-user-form-panel.css', '../../../common/sheet.css'],
  scoped: true,
})
export class IrUserFormPanel {
  @Prop() user: User;
  @Prop() userTypes = Map<number | string, string>;
  @Prop() isEdit: boolean = false;
  @Prop() language: string = 'en';
  @Prop() property_id: number;
  @Prop() haveAdminPrivileges: boolean;
  @Prop() superAdminId: string = '5';
  @Prop() userTypeCode: string | number;
  @Prop() allowedUsersTypes: AllowedUser[] = [];
  @Prop() baseUserTypeCode: string | number;

  @State() isLoading: boolean = false;
  @State() autoValidate = false;
  @State() showFullHistory = false;

  @State() userInfo: User = {
    type: '',
    id: -1,
    is_active: true,
    sign_ins: null,
    created_on: null,
    mobile: '',
    name: '',
    note: '',
    password: '',
    email: '',
    property_id: null,
    username: null,
    phone_prefix: null,
  };

  @State() errors: { [P in keyof User]?: any } | null = null;
  @State() showPasswordValidation: boolean = false;
  @State() isUsernameTaken: boolean;
  @State() isOpen: boolean;
  @State() emailErrorMessage: string;

  @Event() resetData: EventEmitter<null>;
  @Event() closeSideBar: EventEmitter<null>;

  private housekeepingService = new HouseKeepingService();
  private userService = new UserService();
  private disableFields = false;
  private isPropertyAdmin = false;
  private token = new Token();
  private mobileMask = {};
  private userSchema = z.object({
    mobile: z.string().optional(),
    email: z.string().email(),
    password: z
      .string()
      .nullable()
      // .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()\-_=+]).{8,16}$/)
      .refine(
        password => {
          if (this.user && !this.userInfo?.password) {
            return true;
          }
          return CONSTANTS.PASSWORD.test(password);
        },
        { message: 'Password must be at least 8 characters long.' },
      ),
    type: z.union([z.literal(1), z.literal(Number(this.superAdminId?.toString() ?? '5')), z.coerce.string().nonempty().min(2)]),
    username: z
      .string()
      .min(3)
      .refine(
        async name => {
          if (this.user && this.user.username) {
            return true;
          }
          if (name.length >= 3) {
            return !(await new UserService().checkUserExistence({ UserName: name }));
          }
          return true;
        },
        { message: 'Username already exists.' },
      ),
  });
  //make user active by default
  async componentWillLoad() {
    if (!this.user) {
      this.userInfo['property_id'] = this.property_id;
      // this.showPasswordValidation = true;
    }
    if (this.user) {
      this.autoValidate = true;
      this.userInfo = { ...this.user, password: '' };
      // this.disableFields = true;
    }
    this.isPropertyAdmin = this.userTypeCode.toString() === '17';
    if (this.isPropertyAdmin) {
      this.updateUserField('type', '17');
    }
    this.mobileMask = {
      mask: `{${calendar_data.country.phone_prefix}} 000000000000`,
      lazy: false,
      autofix: true,
      placeholderChar: '\u200B',
    };
  }

  private updateUserField(key: keyof User, value: any) {
    this.userInfo = { ...this.userInfo, [key]: value };
  }

  private async createOrUpdateUser() {
    try {
      console.log('hello world');
      this.isLoading = true;
      this.emailErrorMessage = undefined;
      if (!this.autoValidate) {
        this.autoValidate = true;
      }
      const toValidateUserInfo = {
        ...this.userInfo,
        base_user_type_code: this.baseUserTypeCode,
        property_id: this.property_id,
        password: this.user && this.userInfo.password === '' ? this.user.password : this.userInfo.password,
        type: Number(this.userInfo.type),
      };
      console.log('toValidateUserInfo', { ...toValidateUserInfo, mobile: toValidateUserInfo.mobile?.split(' ')?.join('')?.replace(calendar_data.country.phone_prefix, '') ?? '' });
      await this.userSchema.parseAsync({ ...toValidateUserInfo, mobile: toValidateUserInfo.mobile?.split(' ')?.join('')?.replace(calendar_data.country.phone_prefix, '') ?? '' });
      if (this.errors) {
        this.errors = null;
      }
      await this.userService.handleExposedUser(toValidateUserInfo);
      this.resetData.emit(null);
      this.closeSideBar.emit(null);
    } catch (error) {
      console.log(error);
      const e: any = {};
      if (error instanceof ZodError) {
        console.error(error);
        error.issues.map(err => {
          e[err.path[0]] = true;
        });
      } else if (error instanceof InterceptorError && error.code === 'EMAIL_EXISTS') {
        e['email'] = true;
        this.emailErrorMessage = 'This email is already in use. Please create another one.';
      }
      this.errors = e;
    } finally {
      this.isLoading = false;
    }
  }
  private async handleBlur(e: CustomEvent) {
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
      <form
        class="sheet-container"
        onSubmit={async e => {
          e.preventDefault();
          await this.createOrUpdateUser();
        }}
      >
        <ir-title class="px-1 sheet-header" displayContext="sidebar" label={this.isEdit ? this.user.username : 'Create New User'}></ir-title>
        <section class="px-1 sheet-body">
          <ir-input-text
            testId="email"
            zod={this.userSchema.pick({ email: true })}
            wrapKey="email"
            autoValidate={this.autoValidate}
            error={this.errors?.email}
            label={locales.entries.Lcz_Email}
            placeholder=""
            onTextChange={e => this.updateUserField('email', e.detail)}
            value={this.userInfo.email}
            onInputBlur={this.handleBlur.bind(this)}
            maxLength={40}
            errorMessage={this.emailErrorMessage}
          />
          <ir-input-text
            testId="mobile"
            disabled={this.disableFields}
            zod={this.userSchema.pick({ mobile: true })}
            wrapKey="mobile"
            error={this.errors?.mobile}
            asyncParse
            autoValidate={this.user ? (this.userInfo?.mobile !== this.user.mobile ? true : false) : this.autoValidate}
            label={locales.entries.Lcz_Mobile}
            mask={this.mobileMask}
            placeholder={''}
            value={this.userInfo.mobile}
            onTextChange={e => this.updateUserField('mobile', e.detail)}
          />
          {(this.user && this.user?.type?.toString() === this.superAdminId) || this.isPropertyAdmin ? null : (
            <div class="mb-1">
              <ir-select
                testId="user_type"
                error={this.errors?.type && !this.userInfo.type}
                disabled={this.disableFields}
                label="Role"
                data={this.allowedUsersTypes.map(t => ({
                  text: t.value,
                  value: t.code,
                }))}
                firstOption={locales.entries.Lcz_Select}
                selectedValue={this.userInfo.type?.toString()}
                onSelectChange={e => this.updateUserField('type', e.detail)}
              />
            </div>
          )}
          {this.user?.type?.toString() !== '5' && (
            <Fragment>
              <input type="text" name="dummy" style={{ display: 'none' }} />
              <ir-input-text
                testId="username"
                zod={this.userSchema.pick({ username: true })}
                wrapKey="username"
                autoValidate={this.autoValidate}
                error={this.errors?.username}
                label={locales.entries.Lcz_Username}
                disabled={this.disableFields}
                placeholder=""
                onTextChange={e => this.updateUserField('username', e.detail)}
                value={this.userInfo.username}
                // onInputBlur={this.handleBlur.bind(this)}
                maxLength={40}
                autoComplete="off"
              />
            </Fragment>
          )}
          {!this.user ? (
            <Fragment>
              <input type="text" name="dummy" style={{ display: 'none' }} />
              <ir-input-text
                testId="password"
                autoValidate={this.user ? (!this.userInfo?.password ? false : true) : this.autoValidate}
                label={locales.entries.Lcz_Password}
                value={this.userInfo.password}
                autoComplete="off"
                type="password"
                maxLength={16}
                zod={this.userSchema.pick({ password: true })}
                wrapKey="password"
                error={this.errors?.password}
                onInputFocus={() => (this.showPasswordValidation = true)}
                onInputBlur={() => {
                  // if (this.user) this.showPasswordValidation = false;
                }}
                onTextChange={e => this.updateUserField('password', e.detail)}
              ></ir-input-text>
              {this.showPasswordValidation && <ir-password-validator class="mb-1" password={this.userInfo.password}></ir-password-validator>}
            </Fragment>
          ) : (
            // this.haveAdminPrivileges &&
            // this.user.type.toString() !== this.superAdminId &&
            // (this.user?.type.toString() === '17' && this.userTypeCode?.toString() === '17' ? null : (
            <div class="d-flex mt-2 align-items-center justify-content-between">
              <h4 class="m-0 p-0 logins-history-title">{locales.entries.Lcz_Password}</h4>
              <ir-button size="sm" btn_styles={'pr-0'} onClickHandler={() => (this.isOpen = true)} text={locales.entries.Lcz_ChangePassword} btn_color="link"></ir-button>
            </div>
            // ))
          )}
          {this.user?.sign_ins?.length > 0 && (
            <section class="logins-history-section mt-2">
              <div class="d-flex align-items-center logins-history-title-container justify-content-between">
                <h4 class="logins-history-title m-0 p-0">Recent sign-ins</h4>
                {this.user.sign_ins.length > 5 && (
                  <ir-button
                    btn_styles={'pr-0'}
                    text={!this.showFullHistory ? locales.entries.Lcz_ViewAll : locales.entries.Lcz_ViewLess}
                    btn_color="link"
                    size="sm"
                    onClickHandler={() => (this.showFullHistory = !this.showFullHistory)}
                  ></ir-button>
                )}
              </div>
              <ul class="logins-history-list">
                {this.user.sign_ins.slice(0, this.showFullHistory ? this.user.sign_ins.length : 5).map((s, i) => {
                  const ua = UAParser(s.user_agent);
                  return (
                    <li class="login-entry" key={s.date + '_' + i}>
                      <div class="login-meta">
                        <p class="login-datetime">
                          {moment(s.date, 'YYYY-MM-DD').format('DD-MMM-YYYY')} {_formatTime(s.hour?.toString(), s.minute?.toString())} |
                        </p>
                        <p class="login-location">
                          <span class="login-ip">
                            {locales.entries.Lcz_IP}: {s.ip}
                          </span>{' '}
                          &nbsp;|&nbsp;
                          <span class="login-country">
                            {locales.entries.Lcz_Location}: {s.country}
                          </span>{' '}
                          &nbsp;|&nbsp;
                          <span class="login-os">
                            OS: {ua.os.name ?? 'N/A'} {ua.os.version}
                          </span>
                        </p>
                      </div>
                      {/* {ua.device.type && (
                        <div class="login-user-agent">
                          <p class="ua-device">
                            {ua.device.vendor || ''} {ua.device.model} ({ua.device.type})
                          </p>
                        </div>
                      )} */}
                    </li>
                  );
                })}
              </ul>
            </section>
          )}
          <ir-sidebar
            open={this.isOpen}
            showCloseButton={false}
            style={{
              '--sidebar-block-padding': '0',
            }}
            onIrSidebarToggle={e => {
              e.stopImmediatePropagation();
              e.stopPropagation();
              this.isOpen = false;
            }}
          >
            {this.isOpen && (
              <ir-reset-password
                ticket={this.token.getToken()}
                skip2Fa={true}
                username={this.user.username}
                onCloseSideBar={e => {
                  e.stopImmediatePropagation();
                  e.stopPropagation();
                  this.isOpen = false;
                }}
                slot="sidebar-body"
              ></ir-reset-password>
            )}
          </ir-sidebar>
        </section>
        <div class="sheet-footer">
          <ir-button
            data-testid="cancel"
            onClickHandler={() => this.closeSideBar.emit(null)}
            class="flex-fill"
            btn_styles="w-100 justify-content-center align-items-center"
            btn_color="secondary"
            text={locales.entries.Lcz_Cancel}
          ></ir-button>
          <ir-button
            data-testid="save"
            isLoading={this.isLoading}
            class="flex-fill"
            btn_type="submit"
            btn_styles="w-100 justify-content-center align-items-center"
            text={locales.entries.Lcz_Save}
          ></ir-button>
        </div>
      </form>
    );
  }
}
