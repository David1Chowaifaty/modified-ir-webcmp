import { Component, Prop, h } from '@stencil/core';

@Component({
  tag: 'ir-password-validator',
  styleUrl: 'ir-password-validator.css',
  scoped: true,
})
export class IrPasswordValidator {
  /**
   * The password string to validate
   */
  @Prop() password: string = '';

  private get validLength(): boolean {
    if (!this.password) {
      return false;
    }
    return this.password.length >= 8 && this.password.length <= 16;
  }

  private get hasUppercase(): boolean {
    if (!this.password) {
      return false;
    }
    return /[A-Z]/.test(this.password);
  }

  private get hasLowercase(): boolean {
    if (!this.password) {
      return false;
    }
    return /[a-z]/.test(this.password);
  }

  private get hasDigit(): boolean {
    if (!this.password) {
      return false;
    }
    return /[0-9]/.test(this.password);
  }

  private get hasSpecialChar(): boolean {
    if (!this.password) {
      return false;
    }
    return /[!@#$%^&*()\-_=+]/.test(this.password);
  }

  render() {
    return (
      <div class="m-0 p-0">
        <requirement-check isValid={this.validLength} text="Minimum 8 characters"></requirement-check>
        <requirement-check isValid={this.hasUppercase} text="At least one uppercase letter"></requirement-check>
        <requirement-check isValid={this.hasLowercase} text="At least one lowercase letter"></requirement-check>
        <requirement-check isValid={this.hasDigit} text="At least one digit"></requirement-check>
        <requirement-check isValid={this.hasSpecialChar} text="At least one special character"></requirement-check>
      </div>
    );
  }
}
