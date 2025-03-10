import axios from 'axios';

export class UserService {
  public async checkUserExistence(params: { UserName: string }): Promise<boolean> {
    const { data } = await axios.post('/CheckUserExistence', params);
    return data.My_Result;
  }
}
