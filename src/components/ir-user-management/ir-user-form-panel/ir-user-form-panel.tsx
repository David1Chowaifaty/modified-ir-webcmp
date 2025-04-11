import { Component, Event, EventEmitter, Prop, State, h } from '@stencil/core';
import { User } from '../types';
import locales from '@/stores/locales.store';
import { z, ZodError } from 'zod';
import { HouseKeepingService } from '@/services/housekeeping.service';
import { CONSTANTS } from '@/utils/constants';
import { UserService } from '@/services/user.service';
import calendar_data from '@/stores/calendar-data';

@Component({
  tag: 'ir-user-form-panel',
  styleUrls: ['ir-user-form-panel.css', '../../../common/sheet.css'],
  scoped: true,
})
export class IrUserFormPanel {
  @Prop() user: User;
  @Prop() isEdit: boolean = false;
  @Prop() language: string = 'en';
  @Prop() property_id: number;
  @Prop() isSuperAdmin: boolean;

  @State() isLoading: boolean = false;
  @State() autoValidate = false;

  @State() userInfo: User = {
    id: -1,
    is_active: false,
    last_signed_in: '',
    created_at: '',
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

  @Event() resetData: EventEmitter<null>;
  @Event() closeSideBar: EventEmitter<null>;

  private housekeepingService = new HouseKeepingService();
  private disableFields = false;
  private mobileMask = {};
  private userSchema = z.object({
    name: z.string().min(2),
    mobile: z.string().min(1).max(14),
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
          if (this.user && this.user.username === name) {
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

  private async addUser() {
    try {
      this.isLoading = true;
      if (!this.autoValidate) {
        this.autoValidate = true;
      }
      const toValidateUserInfo = { ...this.userInfo, password: this.user && this.userInfo.password === '' ? this.user.password : this.userInfo.password };
      console.log('toValidateUserInfo', toValidateUserInfo);
      await this.userSchema.parseAsync(toValidateUserInfo);
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
          await this.addUser();
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
          <div class="mb-1">
            <ir-select
              disabled={this.disableFields}
              label="Role"
              data={[
                { text: 'Admin', value: '1' },
                { text: 'Frontdesk', value: '2' },
              ]}
              selectedValue={this.userInfo.role}
              onSelectChange={e => this.updateUserField('role', e.detail)}
            />
          </div>
          <ir-input-text
            testId="name"
            zod={this.userSchema.pick({ name: true })}
            wrapKey="name"
            autoValidate={this.autoValidate}
            error={this.errors?.name}
            label="Username"
            disabled={this.disableFields}
            placeholder=""
            onTextChange={e => this.updateUserField('name', e.detail)}
            value={this.userInfo.name}
            onInputBlur={this.handleBlur.bind(this)}
            maxLength={40}
          />
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
