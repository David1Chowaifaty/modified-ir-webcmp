import axios from 'axios';
import { Payment } from '@/components/ir-booking-details/types';
export interface IPaymentAction {
  amount: number;
  currency: {
    code: string;
    id: number;
    symbol: string;
  };
  due_on: string;
  reason: string;
  pay_type_code: string;
  type: 'OVERDUE' | 'FUTURE';
}
export class PaymentService {
  public async AddPayment(payment: Payment, book_nbr: string): Promise<any> {
    try {
      const { data } = await axios.post(`/Do_Payment`, { payment: { ...payment, book_nbr } });
      if (data.ExceptionMsg !== '') {
        throw new Error(data.ExceptionMsg);
      }
      return data.My_Result;
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  }

  public async CancelPayment(id: number): Promise<any> {
    try {
      const { data } = await axios.post(`/Cancel_Payment`, { id });
      if (data.ExceptionMsg !== '') {
        throw new Error(data.ExceptionMsg);
      }
      return data.My_Result;
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  }
  public async GetExposedCancellationDueAmount(params: { booking_nbr: string; currency_id: number }): Promise<IPaymentAction[]> {
    try {
      const { data } = await axios.post(`/Get_Exposed_Cancelation_Due_Amount`, params);
      if (data.ExceptionMsg !== '') {
        throw new Error(data.ExceptionMsg);
      }
      return data.My_Result;
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  }
}
