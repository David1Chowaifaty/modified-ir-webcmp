import axios from 'axios';
import { PaymentOption } from '@/models/payment-options';

export class PaymentOptionService {
  public async GetExposedPaymentMethods() {
    const { data } = await axios.post(`/Get_Exposed_Payment_Methods`);
    if (data.ExceptionMsg !== '') {
      throw new Error(data.ExceptionMsg);
    }
    const results = data.My_Result;
    return results;
  }
  public async GetPropertyPaymentMethods(property_id: string) {
    const { data } = await axios.post(`/Get_Property_Payment_Methods`, { property_id, is_return_sensitive_data: true });
    if (data.ExceptionMsg !== '') {
      throw new Error(data.ExceptionMsg);
    }
    const results = data.My_Result;
    return results;
  }
  public async GetExposedLanguages() {
    const { data } = await axios.post(`/Get_Exposed_Languages`);
    if (data.ExceptionMsg !== '') {
      throw new Error(data.ExceptionMsg);
    }
    const results = data.My_Result;
    return results;
  }
  public async HandlePaymentMethod(paymentOption: PaymentOption) {
    const { data } = await axios.post(`/Handle_Payment_Method`, paymentOption);
    if (data.ExceptionMsg !== '') {
      throw new Error(data.ExceptionMsg);
    }
    const results = data.My_Result;
    return results;
  }
}
