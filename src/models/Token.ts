import axios from 'axios';
import Auth from './Auth';

class Token extends Auth {
  private baseUrl = 'https://gateway.igloorooms.com/IR';
  private static token: string | null = '';
  private static isSameSite: boolean = false;
  private static isInterceptorAdded = false;

  constructor() {
    super();
  }

  private initialize() {
    if (Token.isInterceptorAdded) {
      return;
    }
    axios.defaults.baseURL = this.baseUrl;
    if (Token.isSameSite) {
      axios.defaults.withCredentials = true;
    } else {
      axios.interceptors.request.use(config => {
        if (!Token.token) {
          throw new MissingTokenError();
        }
        config.params = config.params || {};
        config.params.Ticket = Token.token;
        return config;
      });
    }
    Token.isInterceptorAdded = true;
  }

  public setToken(token: string) {
    Token.token = token;
    console.log('set token');
    this.initialize();
  }

  public setIsSameSite(val: boolean) {
    Token.isSameSite = val;
    console.log('set is same site');
    this.initialize();
  }
}
export default Token;
export class MissingTokenError extends Error {
  constructor(message = 'Missing token!!') {
    super(message);
    this.name = 'MissingTokenError';
  }
}
