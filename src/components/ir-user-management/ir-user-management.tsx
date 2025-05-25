import Token from '@/models/Token';
import { User } from '@/models/Users';
import { BookingService } from '@/services/booking.service';
import { RoomService } from '@/services/room.service';
import { UserService } from '@/services/user.service';
import { Component, Host, Listen, Prop, State, Watch, h } from '@stencil/core';
import { AllowedUser } from './types';
import { bookingReasons } from '@/models/IBooking';
import { io, Socket } from 'socket.io-client';
import locales from '@/stores/locales.store';

@Component({
  tag: 'ir-user-management',
  styleUrl: 'ir-user-management.css',
  scoped: true,
})
export class IrUserManagement {
  @Prop() language: string = '';
  @Prop() baseUrl: string;
  @Prop() ticket: string;
  @Prop() propertyid: number;
  @Prop() p: string;
  @Prop() isSuperAdmin: boolean = true;
  @Prop() userTypeCode: string | number;
  @Prop() baseUserTypeCode: string | number;
  @Prop() userId: string | number;

  @State() isLoading = true;
  @State() users: User[] = [];
  @State() property_id: number;
  @State() allowedUsersTypes: AllowedUser[] = [];

  private token = new Token();
  private roomService = new RoomService();
  private userService = new UserService();
  private bookingService = new BookingService();

  private userTypes: Map<number | string, string> = new Map();
  private socket: Socket;

  private superAdminId = '5';

  componentWillLoad() {
    if (this.baseUrl) {
      this.token.setBaseUrl(this.baseUrl);
    }
    if (this.ticket) {
      this.token.setToken(this.ticket);
      this.initializeApp();
    }
  }

  @Watch('ticket')
  ticketChanged(newValue: string, oldValue: string) {
    if (newValue === oldValue) {
      return;
    }
    this.token.setToken(this.ticket);
    this.initializeApp();
  }

  @Listen('resetData')
  async handleResetData(e: CustomEvent) {
    e.stopImmediatePropagation();
    e.stopPropagation();
    await this.fetchUsers();
  }

  private async initializeApp() {
    try {
      if (this.baseUrl) {
        this.token.setBaseUrl(this.baseUrl);
      }
      this.isLoading = true;
      let propertyId = this.propertyid;
      if (!this.propertyid && !this.p) {
        throw new Error('Property ID or username is required');
      }
      // let roomResp = null;
      if (!propertyId) {
        console.log(propertyId);
        const propertyData = await this.roomService.getExposedProperty({
          id: 0,
          aname: this.p,
          language: this.language,
          is_backend: true,
          include_units_hk_status: true,
        });
        // roomResp = propertyData;
        propertyId = propertyData.My_Result.id;
      }
      this.property_id = propertyId;
      const requests = [this.fetchUserTypes(), this.fetchUsers(), this.roomService.fetchLanguage(this.language, ['_USER_MGT'])];
      if (this.propertyid) {
        requests.push(
          this.roomService.getExposedProperty({
            id: this.propertyid,
            language: this.language,
            is_backend: true,
            include_units_hk_status: true,
          }),
        );
      }

      await Promise.all(requests);
      this.socket = io('https://realtime.igloorooms.com/');
      this.socket.on('MSG', async msg => {
        await this.handleSocketMessage(msg);
      });
    } catch (error) {
      console.log(error);
    } finally {
      this.isLoading = false;
    }
  }

  private async handleSocketMessage(msg: string) {
    const msgAsObject = JSON.parse(msg);
    if (!msgAsObject) {
      return;
    }

    const { REASON, KEY, PAYLOAD }: { REASON: bookingReasons; KEY: any; PAYLOAD: any } = msgAsObject;

    if (KEY.toString() !== this.property_id.toString()) {
      return;
    }

    let result = JSON.parse(PAYLOAD);
    console.log(KEY, result);
    // const reasonHandlers: Partial<Record<bookingReasons, Function>> = {
    //   DORESERVATION: this.updateUserVerificationStatus,
    // };
    const reasonHandlers: Partial<Record<bookingReasons, Function>> = {
      EMAIL_VERIFIED: this.updateUserVerificationStatus,
    };
    const handler = reasonHandlers[REASON];
    if (handler) {
      await handler.call(this, result);
    } else {
      console.warn(`Unhandled REASON: ${REASON}`);
    }
  }

  public updateUserVerificationStatus(result: { id: string | number }) {
    const users = [...this.users];
    const idx = users.findIndex(u => u.id === result.id);
    if (idx === -1) {
      console.warn(`User ${result.id} not found`);
      return;
    }
    users[idx] = {
      ...users[idx],
      is_email_verified: true,
    };
    this.users = users;
  }

  private async fetchUsers() {
    const users = await this.userService.getExposedPropertyUsers({ property_id: this.propertyid });
    this.users = [...users].sort((u1: User, u2: User) => {
      const priority = (u: User) => {
        const t = u.type.toString();
        if (t === this.superAdminId) return 0;
        if (t === '17') return 1;
        return 2;
      };
      //sort by priority
      const p1 = priority(u1),
        p2 = priority(u2);
      if (p1 !== p2) {
        return p1 - p2;
      }
      // //sort by user id
      // if (p1 === 1) {
      //   const id1 = u1.id.toString(),
      //     id2 = u2.id.toString(),
      //     me = this.userId.toString();
      //   if (id1 === me) return -1; // u1 is me → goes before u2
      //   if (id2 === me) return 1; // u2 is me → u1 goes after
      // }

      // 3) sort by username
      return u1.username.localeCompare(u2.username);
    });
  }
  private async fetchUserTypes() {
    const res = await Promise.all([this.bookingService.getSetupEntriesByTableName('_USER_TYPE'), this.bookingService.getLov()]);
    const allowedUsers = res[1]?.My_Result?.allowed_user_types;
    for (const e of res[0]) {
      const value = e[`CODE_VALUE_${this.language?.toUpperCase() ?? 'EN'}`];
      if (allowedUsers.find(f => f.code === e.CODE_NAME)) {
        this.allowedUsersTypes.push({ code: e.CODE_NAME, value });
      }
      this.userTypes.set(e.CODE_NAME.toString(), value);
    }
  }
  disconnectedCallback() {
    this.socket.disconnect();
  }
  render() {
    if (this.isLoading) {
      return (
        <Host>
          <ir-toast></ir-toast>
          <ir-interceptor></ir-interceptor>
          <ir-loading-screen></ir-loading-screen>
        </Host>
      );
    }
    return (
      <Host>
        <ir-toast></ir-toast>
        <ir-interceptor suppressToastEndpoints={['/Change_User_Pwd', '/Handle_Exposed_User']}></ir-interceptor>
        <section class="p-2 d-flex flex-column" style={{ gap: '1rem' }}>
          <div class="d-flex  pb-2 align-items-center justify-content-between">
            <h3 class="mb-1 mb-md-0">{locales.entries.Lcz_ExtranetUsers}</h3>
          </div>

          <div class="" style={{ gap: '1rem' }}>
            <ir-user-management-table
              property_id={this.property_id}
              baseUserTypeCode={this.baseUserTypeCode}
              allowedUsersTypes={this.allowedUsersTypes}
              userTypeCode={this.userTypeCode}
              haveAdminPrivileges={[this.superAdminId, '17'].includes(this.userTypeCode?.toString())}
              userTypes={this.userTypes}
              class="card"
              isSuperAdmin={this.userTypeCode?.toString() === this.superAdminId}
              users={this.users}
            ></ir-user-management-table>
          </div>
        </section>
      </Host>
    );
  }
}
