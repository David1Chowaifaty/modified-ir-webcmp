import axios from "axios";

export class RoomService {
  public async fetchData(
    id: number,
    language: string
  ): Promise<{ [key: string]: any }> {
    try {
      const token = JSON.parse(sessionStorage.getItem("token"));
      if (token !== null) {
        const { data } = await axios.post(
          `/Get_Exposed_Property?Ticket=${token}`,
          { id, language }
        );
        if (data.ExceptionMsg !== "") {
          throw new Error(data.ExceptionMsg);
        }
        return data;
      }
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  }
}
