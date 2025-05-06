import axios from 'axios';

export class SystemService {
  public async validateOTP(params: { METHOD_NAME: string; OTP: string }) {
    const { data } = await axios.post('/Validate_OTP', params);
    if (data.ExceptionMsg !== '') {
      throw new Error(data.ExceptionMsg);
    }
    return data;
  }
}
