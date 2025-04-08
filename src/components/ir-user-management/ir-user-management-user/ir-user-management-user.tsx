import { Component, Event, EventEmitter, Host, Prop, State, h } from '@stencil/core';
import { User } from '../types';
import locales from '@/stores/locales.store';
import { z, ZodError } from 'zod';
import { HouseKeepingService } from '@/services/housekeeping.service';
import { CONSTANTS } from '@/utils/constants';
import { UserService } from '@/services/user.service';

@Component({
  tag: 'ir-user-management-user',
  styleUrl: 'ir-user-management-user.css',
  scoped: true,
})
export class IrUserManagementUser {
  @Prop() user: User;
  @Prop() isEdit: boolean = false;
  @Prop() language: string = 'en';
  @Prop() property_id: number;

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
    }
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
    console.log(this.errors);
    return (
      <Host>
        <ir-title class="px-1" displayContext="sidebar" label={this.isEdit ? locales.entries.Lcz_EditHousekeeperProfile : 'Create new user'}></ir-title>
        <section class="px-1">
          <ir-input-text
            testId="name"
            zod={this.userSchema.pick({ name: true })}
            wrapKey="Username"
            autoValidate={this.autoValidate}
            error={this.errors?.name}
            label={'Username'}
            placeholder={''}
            onTextChange={e => this.updateUserField('name', e.detail)}
            value={this.userInfo.name}
            onInputBlur={this.handleBlur.bind(this)}
            maxLength={40}
          ></ir-input-text>
          <ir-input-text
            testId="email"
            zod={this.userSchema.pick({ email: true })}
            wrapKey="email"
            autoValidate={this.autoValidate}
            error={this.errors?.name}
            label={locales.entries.Lcz_Email}
            placeholder={''}
            onTextChange={e => this.updateUserField('name', e.detail)}
            value={this.userInfo.name}
            onInputBlur={this.handleBlur.bind(this)}
            maxLength={40}
          ></ir-input-text>
          <ir-input-text
            testId="mobile"
            zod={this.userSchema.pick({ username: true })}
            wrapKey="username"
            error={this.errors?.username}
            asyncParse
            autoValidate={this.user ? (this.userInfo?.username !== this.user.username ? true : false) : this.autoValidate}
            errorMessage={this.errors?.username && this.userInfo?.username?.length >= 3 ? locales.entries.Lcz_UsernameAlreadyExists : undefined}
            label={locales.entries.Lcz_Username}
            placeholder={locales.entries.Lcz_Username}
            value={this.userInfo.username}
            onTextChange={e => this.updateUserField('username', e.detail)}
          ></ir-input-text>
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
          {this.showPasswordValidation && <ir-password-validator password={this.userInfo.password}></ir-password-validator>}
          <div class="d-flex flex-column flex-md-row align-items-md-center mt-2 w-100">
            <ir-button
              data-testid="cancel"
              onClickHandler={() => this.closeSideBar.emit(null)}
              class="flex-fill"
              btn_styles="w-100  justify-content-center align-items-center"
              btn_color="secondary"
              text={locales.entries.Lcz_Cancel}
            ></ir-button>
            <ir-button
              data-testid="save"
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
