import { Token } from '@/models/Token';
import { IExposedHouseKeepingSetup, IInspectionMode } from '@/models/housekeeping';
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
}
