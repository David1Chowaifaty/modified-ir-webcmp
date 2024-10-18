import axios from 'axios';

class Auth {
  private static isAuthUsed = false;
  private static _isAuthenticated = false;
  private baseUrl = 'https://gateway.igloorooms.com/IR';
  private static subscribers: Array<(isAuthenticated: boolean) => void> = [];

  constructor() {
    if (!Auth.isAuthUsed) {
      this.init();
    }
  }
  public async init() {
    axios.defaults.withCredentials = true;
    axios.defaults.baseURL = this.baseUrl;
    // Auth.isAuthUsed = true;
    // const { data } = await axios.post('/Is_Already_Athenticated');
    // this.setIsAuthenticated(data.My_Result);
  }
  public subscribe(callback: (isAuthenticated: boolean) => void) {
    Auth.subscribers.push(callback);
  }
  public unsubscribe(callback: (isAuthenticated: boolean) => void) {
    Auth.subscribers = Auth.subscribers.filter(sub => sub !== callback);
  }
  public setIsAuthenticated(value: boolean) {
    Auth._isAuthenticated = value;
    Auth.notifySubscribers(value);
  }

  private static notifySubscribers(isAuthenticated: boolean) {
    Auth.subscribers.forEach(callback => callback(isAuthenticated));
  }
  public isAuthenticated() {
    return Auth._isAuthenticated;
  }
}

export default Auth;
