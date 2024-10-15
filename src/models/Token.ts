import axios from 'axios';

export class Token {
  private static token: string | null = '';

  private static isInterceptorAdded = false;

  constructor() {
    if (!Token.isInterceptorAdded) {
      // axios.defaults.withCredentials = true;
      axios.interceptors.request.use(config => {
        if (Token.token) {
          config.params = config.params || {};
          config.params.Ticket = Token.token;
        }
        return config;
      });
      Token.isInterceptorAdded = true;
    }
  }

  public setToken(token: string) {
    Token.token = token;
  }

  public getToken() {
    if (!Token.token) {
      throw new MissingTokenError();
    }
    return Token.token;
  }
}

export class MissingTokenError extends Error {
  constructor(message = 'Missing token!!') {
    super(message);
    this.name = 'MissingTokenError';
  }
}
