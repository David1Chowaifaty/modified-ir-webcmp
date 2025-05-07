import axios from 'axios';

export class SystemService {
  public async validateOTP(params: { METHOD_NAME: string; OTP: string }) {
    const { data } = await axios.post('/Validated_Exposed_Method', params);
    if (data.ExceptionMsg !== '') {
      throw new Error(data.ExceptionMsg);
    }
    return data;
  }
  public async resendOTP(params: { METHOD_NAME: string }) {
    const { data } = await axios.post('/Resend_Exposed_OTP', params);
    if (data.ExceptionMsg !== '') {
      throw new Error(data.ExceptionMsg);
    }
    return data;
  }
}
