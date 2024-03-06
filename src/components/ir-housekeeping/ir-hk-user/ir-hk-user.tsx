import { THKUser } from '@/models/housekeeping';
import { HouseKeepingService } from '@/services/housekeeping.service';
import calendar_data from '@/stores/calendar-data';
import { getDefaultProperties } from '@/stores/housekeeping.store';
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
    username: '',
    phone_prefix: null,
  };

  @State() errors: string[] = [];

  @Event() resetData: EventEmitter<null>;
  @Event() closeSideBar: EventEmitter<null>;

  private housekeepingService = new HouseKeepingService();
  private default_properties = {
    token: '',
    language: '',
  };

  async componentWillLoad() {
    const { token, language } = getDefaultProperties();
    this.default_properties = { token, language };
    this.housekeepingService.setToken(token);
    if (this.user) {
      this.userInfo = { ...this.user };
    }
  }

  updateUserField(key: keyof THKUser, value: any) {
    this.userInfo = { ...this.userInfo, [key]: value };
  }

  async addUser() {
    try {
      this.isLoading = true;
      let errors = [];
      if (this.userInfo.name === '' || this.userInfo.mobile === '') {
        if (this.userInfo.name === '') {
          errors.push('name');
        } else if (this.userInfo.mobile === '') {
          errors.push('mobile');
        }
        this.errors = [...errors];
        return;
      }
      if (this.errors) {
        this.errors = [];
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

  render() {
    return (
      <Host class="px-1">
        <div class="d-flex align-items-center py-1 justify-content-between">
          <h3 class="text-left font-medium-2  py-0 my-0">{this.isEdit ? 'Edit' : 'Create'} housekeeper profile</h3>
          <ir-icon
            class={'m-0 p-0 close'}
            onIconClickHandler={() => {
              this.closeSideBar.emit(null);
            }}
          >
            <svg slot="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" height={20} width={20}>
              <path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z" />
            </svg>
          </ir-icon>
        </div>
        <section class="pt-3 border-top">
          <ir-input-text
            inputStyles={this.errors.includes('name') && 'border-danger'}
            label="Name"
            placeholder=""
            onTextChange={e => this.updateUserField('name', e.detail)}
            value={this.userInfo.name}
          ></ir-input-text>
          <ir-phone-input
            error={this.errors.includes('mobile')}
            language={this.default_properties.language}
            token={this.default_properties.token}
            default_country={calendar_data.country.id}
            phone_prefix={this.user?.phone_prefix}
            label="Mobile"
            value={this.userInfo.mobile}
            onTextChange={e => {
              this.updateUserField('phone_prefix', e.detail.phone_prefix);
              this.updateUserField('mobile', e.detail.mobile);
            }}
          ></ir-phone-input>
          <ir-input-text label="Username" placeholder="" value={this.userInfo.username} onTextChange={e => this.updateUserField('username', e.detail)}></ir-input-text>
          <ir-input-text
            label="Password"
            placeholder=""
            value={this.userInfo.password}
            type="password"
            onTextChange={e => this.updateUserField('password', e.detail)}
          ></ir-input-text>
          <ir-input-text label="Note" placeholder="" value={this.userInfo.note} onTextChange={e => this.updateUserField('note', e.detail)}></ir-input-text>
          <div class="d-flex flex-column flex-md-row align-items-md-center mt-2 w-100">
            <ir-button
              onClickHanlder={() => this.closeSideBar.emit(null)}
              class="flex-fill"
              btn_styles="w-100  justify-content-center align-items-center"
              btn_color="secondary"
              text={'Cancel'}
            ></ir-button>
            <ir-button
              isLoading={this.isLoading}
              onClickHanlder={this.addUser.bind(this)}
              class="flex-fill ml-md-1"
              btn_styles="w-100  justify-content-center align-items-center mt-1 mt-md-0"
              text={'Save'}
            ></ir-button>
          </div>
        </section>
      </Host>
    );
  }
}
