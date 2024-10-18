// import axios from 'axios';
import axios from 'axios';
import Auth from './Auth';

class Token extends Auth {
  private static token: string | null = '';
  private static isSameSite: boolean;

  private static isInterceptorAdded = false;

  constructor() {
    super();
    if (!Token.isInterceptorAdded) {
      if (Token.isSameSite) {
        axios.defaults.withCredentials = true;
      } else {
        axios.interceptors.request.use(config => {
          if (Token.token) {
            config.params = config.params || {};
            config.params.Ticket = Token.token;
          }
          return config;
        });
      }
      Token.isInterceptorAdded = true;
    }
  }

  public setToken(token: string) {
    Token.token = token;
  }
  public setIsSameSite(val: boolean) {
    Token.isSameSite = val;
  }
  public isAuthenticated() {
    return super.isAuthenticated();
  }
  public getToken() {
    if (!Token.token) {
      throw new MissingTokenError();
    }
    return Token.token;
  }
}
export default Token;
export class MissingTokenError extends Error {
  constructor(message = 'Missing token!!') {
    super(message);
    this.name = 'MissingTokenError';
  }
}
