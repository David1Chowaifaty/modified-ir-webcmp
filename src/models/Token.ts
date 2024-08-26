export class Token {
  private token: string | null;
  constructor() {
    this.token = '';
  }
  public setToken(token: string) {
    this.token = token;
  }
  public getToken() {
    return this.token;
  }
}
export class MissingTokenError extends Error {
  constructor(message = 'Missing token!!') {
    super(message);
    this.name = 'MissingTokenError';
  }
}
