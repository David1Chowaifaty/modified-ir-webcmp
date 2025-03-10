import Token from '@/models/Token';
import { AuthService } from '@/services/authenticate.service';
import { isRequestPending } from '@/stores/ir-interceptor.store';
import { Component, Event, EventEmitter, Host, State, h } from '@stencil/core';

@Component({
  tag: 'ir-login',
  styleUrl: 'ir-login.css',
  scoped: true,
})
export class IrLogin {
  @State() username: string;
  @State() password: string;
  @State() showPassword: boolean = false;
  @Event() authFinish: EventEmitter<{
    token: string;
    code: 'succsess' | 'error';
  }>;

  private authService = new AuthService();
  private token = new Token();

  private async handleSignIn(e: Event) {
    e.preventDefault();
    try {
      const token = await this.authService.authenticate({
        password: this.password,
        username: this.username,
      });
      this.token.setToken(token);
      this.authFinish.emit({ token, code: 'succsess' });
    } catch (error) {
      console.log(error.message);
    }
  }
  render() {
    return (
      <Host>
        <ir-interceptor></ir-interceptor>
        <ir-toast></ir-toast>
        <form onSubmit={this.handleSignIn.bind(this)} class="card form-container px-2">
          <img class="logo" src="https://x.igloorooms.com/app-assets/images/logo/logo-dark.png" alt="Login to igloorooms extranet" />
          <div class="separator-container">
            <div class="separator"></div>
            <p>Sign in to manage your property</p>
            <div class="separator"></div>
          </div>
          <ir-input-text value={this.username} onTextChange={e => (this.username = e.detail)} variant="icon" label="" placeholder="Username">
            <ir-icons name="user" slot="icon"></ir-icons>
          </ir-input-text>
          <div class={'position-relative'}>
            <ir-input-text
              value={this.password}
              onTextChange={e => (this.password = e.detail)}
              variant="icon"
              label=""
              placeholder="Password"
              type={this.showPassword ? 'text' : 'password'}
            >
              <ir-icons name="key" slot="icon"></ir-icons>
            </ir-input-text>
            <button type="button" class="password_toggle" onClick={() => (this.showPassword = !this.showPassword)}>
              <ir-icons name={!this.showPassword ? 'open_eye' : 'closed_eye'}></ir-icons>
            </button>
          </div>
          <ir-button isLoading={isRequestPending('/Authenticate')} btn_type="submit" iconPosition="left" icon_name="unlock" text={'Login'} size="md" class="login-btn"></ir-button>
          <div class="card-body text-center p-0 app_links">
            <a href="https://apps.apple.com/lb/app/igloorooms/id1607846173" target="_new">
              <img src="https://x.igloorooms.com/assets/images/svg/AppStore_ios.svg" alt="Install igloorooms iOS App" />
            </a>
            <a href="https://play.google.com/store/apps/details?id=com.iglooroomsapp" target="_new">
              <img src="https://x.igloorooms.com/assets/images/svg/AppStore_android.svg" alt="Install igloorooms Android App" />
            </a>
          </div>
          <a href="https://info.igloorooms.com/signup" class="btn btn-outline-danger btn-block btn-md mt-2" target="_new">
            New to igloorooms?
          </a>
          <p class={'font-small-3  my-1'}>
            By logging in, you accept our{' '}
            <span>
              <a href="https://info.igloorooms.com/privacy/" target="_new">
                Privacy and Cookies Policies
              </a>
            </span>{' '}
            Need help? support@igloorooms.com
          </p>
        </form>
      </Host>
    );
  }
}
