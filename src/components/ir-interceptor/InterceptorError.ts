export class InterceptorError extends Error {
  code: string;

  constructor(message: string, code: string) {
    super(message);
    this.name = 'InterceptorError';
    this.code = code;

    // Ensure the prototype chain is correct (important for `instanceof` checks)
    Object.setPrototypeOf(this, InterceptorError.prototype);
  }
}
