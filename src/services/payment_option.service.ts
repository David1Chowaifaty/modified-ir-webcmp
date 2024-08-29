import { MissingTokenError, Token } from '@/models/Token';
import axios from 'axios';
import { PaymentOption } from '@/models/payment-options';

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
  public async GetPropertyPaymentMethods(property_id: string) {
    const token = this.getToken();
    if (!token) {
      throw new MissingTokenError();
    }
    const { data } = await axios.post(`/Get_Property_Payment_Methods?Ticket=${token}`, { property_id, is_return_sensitive_data: true });
    if (data.ExceptionMsg !== '') {
      throw new Error(data.ExceptionMsg);
    }
    const results = data.My_Result;
    return results;
  }
  public async GetExposedLanguages() {
    const token = this.getToken();
    if (!token) {
      throw new MissingTokenError();
    }
    const { data } = await axios.post(`/Get_Exposed_Languages?Ticket=${token}`);
    if (data.ExceptionMsg !== '') {
      throw new Error(data.ExceptionMsg);
    }
    const results = data.My_Result;
    return results;
  }
  public async HandlePaymentMethod(paymentOption: PaymentOption) {
    const token = this.getToken();
    if (!token) {
      throw new MissingTokenError();
    }
    const { data } = await axios.post(`/Handle_Payment_Method?Ticket=${token}`, paymentOption);
    if (data.ExceptionMsg !== '') {
      throw new Error(data.ExceptionMsg);
    }
    const results = data.My_Result;
    return results;
  }
}
