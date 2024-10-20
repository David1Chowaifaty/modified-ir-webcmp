import { IExposedHouseKeepingSetup, IInspectionMode, IPropertyHousekeepingAssignment, THKUser, TPendingHkSetupParams } from '@/models/housekeeping';
import { updateHKStore } from '@/stores/housekeeping.store';
import axios from 'axios';

export class HouseKeepingService {
  public async getExposedHKSetup(property_id: number): Promise<IExposedHouseKeepingSetup> {
    const { data } = await axios.post(`/Get_Exposed_HK_Setup`, {
      property_id,
    });
    updateHKStore('hk_criteria', data['My_Result']);
    return data['My_Result'];
  }
  public async getExposedHKStatusCriteria(property_id: number): Promise<IExposedHouseKeepingSetup> {
    const { data } = await axios.post(`/Get_Exposed_HK_Status_Criteria`, {
      property_id,
    });
    updateHKStore('hk_tasks', data['My_Result']);
    return data['My_Result'];
  }

  public async setExposedInspectionMode(property_id: number, mode: IInspectionMode) {
    const { data } = await axios.post(`/Set_Exposed_Inspection_Mode`, {
      property_id,
      mode,
    });
    return data['My_Result'];
  }
  public async manageExposedAssignedUnitToHKM(property_id: number, assignments: IPropertyHousekeepingAssignment[]) {
    const { data } = await axios.post(`/Manage_Exposed_Assigned_Unit_To_HKM`, {
      property_id,
      links: assignments,
    });
    return data['My_Result'];
  }
  public async editExposedHKM(params: THKUser, is_to_remove: boolean = false) {
    const { data } = await axios.post(`/Edit_Exposed_HKM`, { ...params, is_to_remove });
    return data['My_Result'];
  }
  public async getHKPendingActions(params: TPendingHkSetupParams) {
    const { data } = await axios.post(`/Get_HK_Pending_Actions`, { ...params });
    updateHKStore('pending_housekeepers', [...data['My_Result']]);
    return data['My_Result'];
  }
  public async executeHKAction(params) {
    await axios.post(`/Execute_HK_Action`, { ...params });
  }
  public async generateUserName(name: string) {
    const { data } = await axios.post(`/Generate_UserName`, { name });
    return data.My_Result;
  }
}
