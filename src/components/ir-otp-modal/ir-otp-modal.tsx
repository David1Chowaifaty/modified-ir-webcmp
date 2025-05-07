import Token from '@/models/Token';
import { SystemService } from '@/services/system.service';
import { Component, Event, EventEmitter, Fragment, Host, Method, Prop, State, Watch, h } from '@stencil/core';
import { z } from 'zod';

@Component({
  tag: 'ir-otp-modal',
  styleUrl: 'ir-otp-modal.css',
  scoped: false,
})
export class IrOtpModal {
  /** Number of seconds to wait before allowing OTP resend */
  @Prop() resendTimer = 60;

  /** URL or endpoint used to validate the OTP */
  @Prop() requestUrl: string;

  /** Whether the resend option should be visible */
  @Prop() showResend: boolean = true;

  /** User's email address to display in the modal and send the OTP to */
  @Prop() email: string;

  /** Number of digits the OTP should have */
  @Prop() otpLength: number = 6;

  /** ticket for verifying and resending the verification code */
  @Prop() ticket: string;

  @State() otp = '';
  @State() error = '';
  @State() isLoading = false;
  @State() timer = 60;

  private modalRef!: HTMLDivElement;
  private timerInterval: number;
  private systemService = new SystemService();
  private tokenService = new Token();

  private otpVerificationSchema = z.object({ email: z.string().nonempty(), requestUrl: z.string().nonempty(), otp: z.string().length(this.otpLength) });

  /** Emits the final OTP (or empty on cancel) */
  @Event({ bubbles: true, composed: true }) otpFinished: EventEmitter<string>;

  componentWillLoad() {
    if (this.ticket) {
      this.tokenService.setToken(this.ticket);
    }
  }
  @Watch('ticket')
  handleTicketChange(newValue: string, oldValue: string) {
    if (newValue !== oldValue) {
      this.tokenService.setToken(newValue);
    }
  }
  /** Open & reset everything */
  @Method()
  async openModal() {
    this.resetState();
    $(this.modalRef).modal({ backdrop: 'static', keyboard: false });
    $(this.modalRef).modal('show');
    if (this.showResend) this.startTimer();
    await this.focusFirstInput();
  }

  /** Hide & clear timer */
  @Method()
  async closeModal() {
    $(this.modalRef).modal('hide');
    this.otp = null;
    this.clearTimer();
  }

  private resetState() {
    this.otp = '';
    this.error = '';
    this.isLoading = false;
    this.timer = 60;
    this.clearTimer();
  }

  private startTimer() {
    this.clearTimer();
    this.timerInterval = window.setInterval(() => {
      if (this.timer > 0) {
        this.timer--;
      } else {
        this.clearTimer();
      }
    }, 1000);
  }

  private clearTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  private async focusFirstInput() {
    await new Promise(r => setTimeout(r, 50));
    const first = this.modalRef.querySelector('input');
    first && (first as HTMLInputElement).focus();
  }

  private handleOtpComplete = (e: CustomEvent<string>) => {
    this.error = '';
    this.otp = e.detail;
  };

  private async verifyOtp() {
    if (this.otp.length < this.otpLength) return;
    this.isLoading = true;
    this.otpVerificationSchema.parse({
      otp: this.otp,
      requestUrl: this.requestUrl,
      email: this.email,
    });
    try {
      await this.systemService.validateOTP({ METHOD_NAME: this.requestUrl, OTP: this.otp });
      // emit the filled OTP back to the interceptor
      this.otpFinished.emit(this.otp);
      this.closeModal();
    } catch (err) {
      this.error = 'Verification failed. Please try again.';
    } finally {
      this.isLoading = false;
    }
  }

  private async resendOtp() {
    if (this.timer > 0) return;
    // Resend otp
    try {
      await this.systemService.resendOTP({ METHOD_NAME: this.requestUrl });
      this.timer = 60;
      this.startTimer();
    } catch (error) {
      console.log(error);
    }
  }
  disconnectedCallback() {
    this.clearTimer();
  }
  render() {
    return (
      <Host>
        <div ref={el => (this.modalRef = el as any)} class="modal fade" id="staticBackdrop" aria-hidden="true">
          <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title">Verify Your Identity</h5>
              </div>

              <div class="modal-body d-flex  align-items-center flex-column">
                <p class="sm text-center">
                  We sent a verification code to <span class="text-primary">{this.email}</span>
                </p>
                <ir-otp
                  autoFocus
                  length={this.otpLength}
                  defaultValue={this.otp}
                  // value={this.otp}
                  onOtpComplete={this.handleOtpComplete}
                ></ir-otp>

                {this.error && <p class="text-danger small mt-1 p-0 mb-0">{this.error}</p>}

                {this.showResend && (
                  <Fragment>
                    {this.timer > 0 ? (
                      <p class="small mt-1">Resend code in 00:{String(this.timer).padStart(2, '0')}</p>
                    ) : (
                      <ir-button
                        class="mt-1"
                        btn_color="link"
                        onClickHandler={e => {
                          e.stopImmediatePropagation();
                          e.stopPropagation();
                          this.resendOtp();
                        }}
                        size="sm"
                        text="Didn’t receive code? Resend"
                      ></ir-button>
                    )}
                  </Fragment>
                )}
              </div>

              <div class="modal-footer justify-content-auto">
                <ir-button
                  class="w-100"
                  btn_styles={'flex-fill'}
                  text="Verify now"
                  isLoading={this.isLoading}
                  btn_disabled={this.otp.length < this.otpLength || this.isLoading}
                  onClick={() => this.verifyOtp()}
                ></ir-button>
              </div>
            </div>
          </div>
        </div>
      </Host>
    );
  }
}
