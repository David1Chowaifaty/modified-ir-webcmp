import axios from 'axios';
import { IPayment } from '@/models/booking.dto';
export interface IPaymentAction {
  amount: number;
  currency: {
    code: string;
    id: number;
    symbol: string;
  };
  due_on: string;
  type: 'overdue' | 'future';
}
export class PaymentService {
  public async AddPayment(payment: IPayment, book_nbr: string): Promise<any> {
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
  public async GetExposedCancelationDueAmount(params: { booking_nbr: string; currency_id: number }): Promise<IPaymentAction[]> {
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
