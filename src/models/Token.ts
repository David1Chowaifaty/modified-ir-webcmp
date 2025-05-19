import axios from 'axios';
import Auth from './Auth';

class Token extends Auth {
  private baseUrl = 'https://gateway.igloorooms.com/IR';
  private static token: string | null = '';
  private static modifiedBaseUrl: boolean = false;
  private static isInterceptorAdded = false;

  constructor() {
    super();
    if (Token.modifiedBaseUrl) {
      return;
    }
    Token.modifiedBaseUrl = true;
    axios.defaults.baseURL = this.baseUrl;
  }
  public getToken() {
    return Token.token;
  }
  public setBaseUrl(url: string) {
    this.baseUrl = url;
  }
  private initialize() {
    if (Token.isInterceptorAdded) {
      return;
    }

    axios.interceptors.request.use(config => {
      if (!Token.token) {
        throw new MissingTokenError();
      }
      config.headers.Authorization = Token.token;
      // config.params = config.params || {};
      // config.params.Ticket = Token.token;
      return config;
    });

    Token.isInterceptorAdded = true;
  }

  public setToken(token: string) {
    Token.token = token;
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
