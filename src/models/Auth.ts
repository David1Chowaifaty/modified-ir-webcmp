import axios from 'axios';

class Auth {
  private static isAuthUsed = false;
  private static isAuthenticated = false;
  private baseUrl = 'https://gateway.igloorooms.com/IR';
  constructor() {
    if (!Auth.isAuthUsed) {
      this.init();
    }
  }
  public async init() {
    axios.defaults.withCredentials = true;
    axios.defaults.baseURL = this.baseUrl;
    Auth.isAuthUsed = true;
    const { data } = await axios.post('/Is_Already_Athenticated');
    Auth.isAuthenticated = data.My_Result;
    // if (!data.My_Result) {
    //   alert('You Must Login');
    // }
  }
  public isAuthenticated() {
    return Auth.isAuthenticated;
  }
}
export default Auth;
