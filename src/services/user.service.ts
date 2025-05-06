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
    const { data } = await axios.post('/Handle_Exposed_User', params);
    return data.My_Result;
  }
  public async getExposedPropertyUsers() {
    const { data } = await axios.post('/Get_Exposed_Property_Users', {});
    return data.My_Result;
  }
}
