import Token from '@/models/Token';
import { RoomService } from '@/services/room.service';
import { Component, Host, Prop, State, Watch, h } from '@stencil/core';
import { User } from './types';

@Component({
  tag: 'ir-user-management',
  styleUrl: 'ir-user-management.css',
  scoped: true,
})
export class IrUserManagement {
  @Prop() language: string = '';
  @Prop() ticket: string = '';
  @Prop() propertyid: number;
  @Prop() p: string;
  @Prop() isSuperAdmin: boolean = true;

  @State() isLoading = true;
  @State() users: User[] = [
    {
      id: 1,
      mobile: '1234567890',
      name: 'Alice Johnson',
      note: 'Admin user',
      password: 'securePass1',
      property_id: 101,
      phone_prefix: '+1',
      username: 'alicej',
      email: 'alice.johnson@example.com',
      is_active: true,
      last_signed_in: '2025-04-08',
      created_at: '2023-09-15',
      role: 'super admin',
    },
    {
      id: 2,
      mobile: '2345678901',
      name: 'Bob Smith',
      note: 'Temporary access',
      password: 'securePass2',
      property_id: 102,
      phone_prefix: '+44',
      username: 'bobsmith',
      email: 'bob.smith@example.com',
      is_active: false,
      last_signed_in: '2025-03-27',
      created_at: '2023-11-20',
      role: 'admin',
    },
    {
      id: 3,
      mobile: '3456789012',
      name: 'Carla Reyes',
      note: 'Manager account',
      password: 'securePass3',
      property_id: 103,
      phone_prefix: '+61',
      username: 'carlar',
      email: 'carla.reyes@example.com',
      is_active: true,
      last_signed_in: '2025-02-19',
      created_at: '2024-01-05',
      role: 'frontdesk',
    },
    {
      id: 4,
      mobile: '4567890123',
      name: 'Daniel Kim',
      note: 'Viewer only',
      password: 'securePass4',
      property_id: 104,
      phone_prefix: '+81',
      username: 'danielk',
      email: 'daniel.kim@example.com',
      is_active: false,
      last_signed_in: '2025-01-10',
      created_at: '2022-08-23',
      role: 'frontdesk',
    },
    {
      id: 5,
      mobile: '5678901234',
      name: 'Eva Liu',
      note: 'Editor role',
      password: 'securePass5',
      property_id: 105,
      phone_prefix: '+86',
      username: 'evaliu',
      email: 'eva.liu@example.com',
      is_active: true,
      last_signed_in: '2025-04-01',
      created_at: '2023-12-12',
      role: 'admin',
    },
  ];
  @State() property_id: number;

  private token = new Token();
  private roomService = new RoomService();

  @Watch('ticket')
  ticketChanged(newValue: string, oldValue: string) {
    if (newValue === oldValue) {
      return;
    }
    this.token.setToken(this.ticket);
    this.initializeApp();
  }
  private async initializeApp() {
    try {
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
      const requests = [this.roomService.fetchLanguage(this.language)];
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
    } catch (error) {
      console.log(error);
    } finally {
      this.isLoading = false;
    }
  }
  render() {
    if (this.isLoading) {
      return <ir-loading-screen></ir-loading-screen>;
    }
    return (
      <Host>
        <ir-toast></ir-toast>
        <ir-interceptor></ir-interceptor>
        <section class="p-2 d-flex flex-column" style={{ gap: '1rem' }}>
          <div class="d-flex align-items-center justify-content-between">
            <h3 class="mb-1 mb-md-0">Extranet Users</h3>
          </div>
          <div class="" style={{ gap: '1rem' }}>
            <ir-user-management-table isSuperAdmin={this.isSuperAdmin} users={this.users}></ir-user-management-table>
          </div>
        </section>
      </Host>
    );
  }
}
