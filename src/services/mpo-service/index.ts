import axios from 'axios';
import { ExposedMPOSchema } from './types';

export class MPOService {
  public async fetchExposedMpos() {
    const { data } = await axios.post('/Fetch_Exposed_Mpos', {});
    if (data.ExceptionMsg !== '') {
      throw new Error(data.ExceptionMsg);
    }
    return data.My_Result;
  }
  public async getExposedMpo(params: { id: number }) {
    const { data } = await axios.post('/Get_Exposed_Mpo', params);
    if (data.ExceptionMsg !== '') {
      throw new Error(data.ExceptionMsg);
    }
    return ExposedMPOSchema.parse(data.My_Result);
  }
}
