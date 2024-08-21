import axios from 'axios';
export class AuthService {
  public async authenticate(params: { username: string; password: string }) {
    const { data } = await axios.post('/Authenticate', params);
    if (data.ExceptionMsg !== '') {
      throw new Error(data.ExceptionMsg);
    }
    //  sessionStorage.setItem('token', JSON.stringify(data.My_Result));
    return data['My_Result'];
  }
}
