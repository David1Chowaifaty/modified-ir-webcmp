import axios from "axios";
export class AuthService {
  private data: {
    username: string | null;
    password: string | null;
  };

  constructor() {
    this.data = {
      username: null,
      password: null,
    };
  }

  public async authenticate(
    baseurl: string,
    userName: string,
    password: string
  ) {
    this.data = {
      username: userName,
      password: password,
    };
    axios.defaults.baseURL = baseurl;
    const { data } = await axios.post("/Authenticate", { ...this.data });
    sessionStorage.setItem("token", JSON.stringify(data.My_Result));
  }
}
