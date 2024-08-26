import { MissingTokenError, Token } from '@/models/Token';
import axios from 'axios';

export class PaymentOptionService extends Token {
  public async GetExposedPaymentMethods() {
    const token = this.getToken();
    if (!token) {
      throw new MissingTokenError();
    }
    const { data } = await axios.post(`/Get_Exposed_Payment_Methods?Ticket=${token}`);
    if (data.ExceptionMsg !== '') {
      throw new Error(data.ExceptionMsg);
    }
    const results = data.My_Result;
    return results;
  }
}
