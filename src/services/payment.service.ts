import axios from 'axios';
import { IPayment } from '@/models/booking.dto';

export class PaymentService {
  public async AddPayment(payment: IPayment, book_nbr: string): Promise<any> {
    try {
      const token = JSON.parse(sessionStorage.getItem('token'));
      if (token !== null) {
        const { data } = await axios.post(`/Do_Payment?Ticket=${token}`, { payment: { ...payment, book_nbr } });
        if (data.ExceptionMsg !== '') {
          throw new Error(data.ExceptionMsg);
        }
        return data.My_Result;
      }
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  }

  public async CancelPayment(id: number): Promise<any> {
    try {
      const token = JSON.parse(sessionStorage.getItem('token'));
      if (token !== null) {
        const { data } = await axios.post(`/Cancel_Payment?Ticket=${token}`, { id });
        if (data.ExceptionMsg !== '') {
          throw new Error(data.ExceptionMsg);
        }
        return data.My_Result;
      }
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  }
}
