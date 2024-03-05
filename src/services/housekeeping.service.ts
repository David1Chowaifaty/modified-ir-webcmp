import { Token } from '@/models/Token';
import { IExposedHouseKeepingSetup, IInspectionMode, THKUser } from '@/models/housekeeping';
import { updateHKStore } from '@/stores/housekeeping.store';
import axios from 'axios';

export class HouseKeepingService extends Token {
  public async getExposedHKSetup(property_id: number): Promise<IExposedHouseKeepingSetup> {
    const token = this.getToken();
    if (!token) {
      throw new Error('Missing token');
    }
    const { data } = await axios.post(`/Get_Exposed_HK_Setup?Ticket=${token}`, {
      property_id,
    });
    updateHKStore('hk_criteria', data['My_Result']);
    return data['My_Result'];
  }

  public async setExposedInspectionMode(property_id: number, mode: IInspectionMode) {
    const token = this.getToken();
    if (!token) {
      throw new Error('Missing token');
    }
    const { data } = await axios.post(`/Set_Exposed_Inspection_Mode?Ticket=${token}`, {
      property_id,
      mode,
    });
    return data['My_Result'];
  }
  public async editExposedHKM(params: THKUser, is_to_remove: boolean = false) {
    const token = this.getToken();
    if (!token) {
      throw new Error('Missing token');
    }
    const { data } = await axios.post(`/Edit_Exposed_HKM?Ticket=${token}`, { ...params, is_to_remove });
    return data['My_Result'];
  }
}
