import { UserParams } from '@/models/Users';
import { sleep } from '@/utils/utils';
import axios from 'axios';

export class UserService {
  public async sendVerificationEmail() {
    // throw new Error('Method not implemented.');
    await sleep(400);
  }
  public async checkUserExistence(params: { UserName: string }): Promise<boolean> {
    const { data } = await axios.post('/CheckUserExistence', params);
    return data.My_Result;
  }
  public async handleExposedUser(params: UserParams) {
    const { base_user_type_code, property_id, ...rest } = params;
    let body: any = { ...rest };
    if ([1, 4].includes(Number(base_user_type_code))) {
      body = { ...body, property_id };
    }
    const { data } = await axios.post('/Handle_Exposed_User', body);
    console.warn('data<==>', data);
    return data.My_Result;
  }
  public async getExposedPropertyUsers({ property_id }: { property_id: number }) {
    const { data } = await axios.post('/Get_Exposed_Property_Users', { property_id });
    return data.My_Result;
  }
}
