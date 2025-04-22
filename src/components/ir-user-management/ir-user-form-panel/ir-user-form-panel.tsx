import { Component, Event, EventEmitter, Fragment, Prop, State, h } from '@stencil/core';

import locales from '@/stores/locales.store';
import { z, ZodError } from 'zod';
import { HouseKeepingService } from '@/services/housekeeping.service';
import { CONSTANTS } from '@/utils/constants';
import { UserService } from '@/services/user.service';
import calendar_data from '@/stores/calendar-data';
import { User } from '@/models/Users';
import { BookingService } from '@/services/booking.service';

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
  @Prop() isSuperAdmin: boolean;

  @State() isLoading: boolean = false;
  @State() autoValidate = false;

  @State() userInfo: User = {
    type: '',
    id: -1,
    is_active: false,
    last_sign_in: null,
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

  @Event() resetData: EventEmitter<null>;
  @Event() closeSideBar: EventEmitter<null>;

  private housekeepingService = new HouseKeepingService();
  private userService = new UserService();
  private bookingService = new BookingService();

  private disableFields = false;
  private mobileMask = {};
  private userSchema = z.object({
    mobile: z.string().min(1).max(12),
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
  async componentWillLoad() {
    if (!this.user) {
      this.userInfo['property_id'] = this.property_id;
      // this.showPasswordValidation = true;
    }
    if (this.user) {
      this.autoValidate = true;
      this.userInfo = { ...this.user, password: '' };
      this.disableFields = this.isSuperAdmin;
    }
    await this.bookingService.getSetupEntriesByTableName('_USER_TYPE');
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
      this.isLoading = true;
      if (!this.autoValidate) {
        this.autoValidate = true;
      }
      const toValidateUserInfo = { ...this.userInfo, password: this.user && this.userInfo.password === '' ? this.user.password : this.userInfo.password };
      console.log('toValidateUserInfo', { ...toValidateUserInfo, mobile: toValidateUserInfo.mobile.split(' ').join('').replace(calendar_data.country.phone_prefix, '') });
      await this.userSchema.parseAsync({ ...toValidateUserInfo, mobile: toValidateUserInfo.mobile.split(' ').join('').replace(calendar_data.country.phone_prefix, '') });
      if (this.errors) {
        this.errors = null;
      }
      await this.userService.handleExposedUser(toValidateUserInfo);
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
        <ir-title class="px-1 sheet-header" displayContext="sidebar" label={this.isEdit ? 'Edit User' : 'Create New User'}></ir-title>
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
          />
          <ir-input-text
            testId="mobile"
            disabled={this.disableFields}
            zod={this.userSchema.pick({ mobile: true })}
            wrapKey="mobile"
            error={this.errors?.mobile}
            asyncParse
            autoValidate={this.user ? (this.userInfo?.mobile !== this.user.mobile ? true : false) : this.autoValidate}
            label="Mobile"
            mask={this.mobileMask}
            placeholder={''}
            value={this.userInfo.mobile}
            onTextChange={e => this.updateUserField('mobile', e.detail)}
          />
          {this.user && this.user?.type?.toString() === '1' ? null : (
            <div class="mb-1">
              <ir-select
                disabled={this.disableFields}
                label="Role"
                data={[
                  { text: 'Frontdesk', value: '16' },
                  { text: 'Property Admin', value: '17' },
                ]}
                selectedValue={this.userInfo.type}
                onSelectChange={e => this.updateUserField('type', e.detail)}
              />
            </div>
          )}
          <ir-input-text
            testId="username"
            zod={this.userSchema.pick({ username: true })}
            wrapKey="username"
            autoValidate={this.autoValidate}
            error={this.errors?.username}
            label="Username"
            disabled={this.disableFields}
            placeholder=""
            onTextChange={e => this.updateUserField('username', e.detail)}
            value={this.userInfo.username}
            onInputBlur={this.handleBlur.bind(this)}
            maxLength={40}
          />
          {!this.user ? (
            <Fragment>
              <ir-input-text
                testId="password"
                autoValidate={this.user ? (!this.userInfo?.password ? false : true) : this.autoValidate}
                label={'Password'}
                value={this.userInfo.password}
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
            this.isSuperAdmin && (
              <div class="d-flex align-items-center justify-content-between">
                <h4 class="m-0 p-0">Password</h4>
                <ir-button btn_styles={'pr-0'} onClickHandler={() => (this.isOpen = true)} text="Change password" btn_color="link"></ir-button>
              </div>
            )
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
