import Token from '@/models/Token';
import { AuthService } from '@/services/authenticate.service';
import { CONSTANTS } from '@/utils/constants';
import { Component, Element, Event, EventEmitter, Prop, State, Watch, h } from '@stencil/core';
import { z, ZodError } from 'zod';

@Component({
  tag: 'ir-reset-password',
  styleUrls: ['ir-reset-password.css', '../../common/sheet.css'],
  scoped: true,
})
export class IrResetPassword {
  @Element() el: HTMLIrResetPasswordElement;

  @Prop() username: string;
  @Prop() old_pwd: string;
  @Prop() ticket: string;
  @Prop() skip2Fa: boolean;

  @State() confirmPassword: string;
  @State() password: string;
  @State() showValidator: boolean = false;
  @State() autoValidate: boolean = false;
  @State() error: { password?: boolean; confirm_password?: boolean } = {};
  @State() submitted: boolean = false;
  @State() isLoading = false;

  @Event() authFinish: EventEmitter<{
    token: string;
    code: 'succsess' | 'error';
  }>;
  @Event() closeSideBar: EventEmitter<null>;

  private token = new Token();
  private authService = new AuthService();
  componentWillLoad() {
    if (this.ticket) {
      this.token.setToken(this.ticket);
    }
  }
  @Watch('ticket')
  handleTicketChange(oldValue: string, newValue: string) {
    if (oldValue !== newValue) {
      this.token.setToken(this.ticket);
    }
  }

  private ResetPasswordSchema = z.object({
    password: z.string().regex(CONSTANTS.PASSWORD),
    confirm_password: z
      .string()
      .nullable()
      .refine(
        password => {
          if (!CONSTANTS.PASSWORD.test(password)) {
            return false;
          }
          return password === this.password;
        },
        { message: 'Password must be at least 8 characters long.' },
      ),
  });

  private async handleChangePassword(e: Event) {
    e.preventDefault();
    try {
      this.error = {};
      this.isLoading = true;
      this.autoValidate = true;
      this.ResetPasswordSchema.parse({
        password: this.password,
        confirm_password: this.confirmPassword,
      });
      await this.authService.changeUserPwd({
        username: this.username,
        new_pwd: this.password,
        old_pwd: this.old_pwd,
      });
      if (!this.skip2Fa) {
        this.submitted = true;
      }
      if (this.el.slot === 'sidebar-body') {
        this.closeSideBar.emit();
      }
    } catch (error) {
      if (error instanceof ZodError) {
        let validationErrors = {};
        error.issues.map(issue => {
          const path = issue.path[0];
          console.log(path, issue);
          if (path === 'password') {
            this.showValidator = true;
          }
          validationErrors[path] = true;
        });
        this.error = validationErrors;
      }
    } finally {
      this.isLoading = false;
    }
  }
  render() {
    const insideSidebar = this.el.slot === 'sidebar-body';
    return (
      <div class={{ 'base-host': !insideSidebar, 'h-100': insideSidebar }}>
        <ir-interceptor></ir-interceptor>
        <ir-toast></ir-toast>
        <form onSubmit={this.handleChangePassword.bind(this)} class={{ 'sheet-container': insideSidebar }}>
          {insideSidebar && <ir-title class="px-1 sheet-header" displayContext="sidebar" label={'Change Password'}></ir-title>}
          <div class={{ 'form-container': true, 'sheet-body px-1': insideSidebar, 'px-2': !insideSidebar }}>
            <svg class="lock-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" height={24} width={24}>
              <path
                fill="currentColor"
                d="M144 144l0 48 160 0 0-48c0-44.2-35.8-80-80-80s-80 35.8-80 80zM80 192l0-48C80 64.5 144.5 0 224 0s144 64.5 144 144l0 48 16 0c35.3 0 64 28.7 64 64l0 192c0 35.3-28.7 64-64 64L64 512c-35.3 0-64-28.7-64-64L0 256c0-35.3 28.7-64 64-64l16 0z"
              />
            </svg>
            <div class="text-center mb-2">
              <h4 class="mb-1">Set new Password</h4>
              {this.submitted ? (
                <p>An email has been sent to your address. Please check your inbox to confirm the password change.</p>
              ) : (
                <p>Your new password must be different to previously used password</p>
              )}
            </div>
            {!this.submitted && (
              <section>
                <div class={'mb-2'}>
                  <div class="m-0 p-0">
                    <div class={'position-relative'}>
                      <ir-input-text
                        error={this.error?.password}
                        autoValidate={this.autoValidate}
                        value={this.password}
                        onTextChange={e => (this.password = e.detail)}
                        label=""
                        class="m-0 p-0"
                        inputStyles={'m-0'}
                        zod={this.ResetPasswordSchema.pick({ password: true })}
                        wrapKey="password"
                        placeholder="New Password"
                        onInputFocus={() => (this.showValidator = true)}
                        type={'password'}
                      ></ir-input-text>
                      {/* <button type="button" class="password_toggle" onClick={() => (this.showPassword = !this.showPassword)}>
                <ir-icons name={!this.showPassword ? 'open_eye' : 'closed_eye'}></ir-icons>
              </button> */}
                    </div>
                    {this.showValidator && <ir-password-validator class="mb-1" password={this.password}></ir-password-validator>}
                  </div>
                  <div class={'position-relative'}>
                    <ir-input-text
                      error={this.error?.confirm_password}
                      autoValidate={this.autoValidate}
                      zod={this.ResetPasswordSchema.pick({ confirm_password: true })}
                      wrapKey="confirm_password"
                      value={this.confirmPassword}
                      onTextChange={e => (this.confirmPassword = e.detail)}
                      label=""
                      placeholder="Confirm Password"
                      type={'password'}
                    ></ir-input-text>
                    {/* <button type="button" class="password_toggle" onClick={() => (this.showPassword = !this.showPassword)}>
              <ir-icons name={!this.showPassword ? 'open_eye' : 'closed_eye'}></ir-icons>
            </button> */}
                  </div>
                </div>

                {!insideSidebar && <ir-button isLoading={this.isLoading} btn_type="submit" text={'Change password'} size="md" class="login-btn mt-1"></ir-button>}
              </section>
            )}
          </div>
          {insideSidebar && (
            <div class={'sheet-footer w-full'}>
              <ir-button
                text={'Cancel'}
                onClickHandler={() => this.closeSideBar.emit(null)}
                class="flex-fill"
                btn_color="secondary"
                btn_styles="w-100 justify-content-center align-items-center"
                size="md"
              ></ir-button>
              <ir-button
                isLoading={this.isLoading}
                class="flex-fill"
                btn_type="submit"
                btn_styles="w-100 justify-content-center align-items-center"
                text={'Change password'}
                size="md"
              ></ir-button>
            </div>
          )}
        </form>
      </div>
    );
  }
}
