import { SystemService } from '@/services/system.service';
import { Component, Event, EventEmitter, Host, Method, Prop, State, h } from '@stencil/core';

@Component({
  tag: 'ir-otp-modal',
  styleUrl: 'ir-otp-modal.css',
  scoped: false,
})
export class IrOtpModal {
  @Prop() resendTimer = 60;
  @Prop() requestUrl: string;
  @Prop() showResend: boolean = true;
  @State() otp = '';
  @State() error = '';
  @State() isLoading = false;
  @State() timer = 60;

  private modalRef!: HTMLDivElement;
  private timerInterval: number;
  private systemService = new SystemService();

  /** Emits the final OTP (or empty on cancel) */
  @Event({ bubbles: true, composed: true }) otpFinished: EventEmitter<string>;

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

  /** Called by your <ir-otp> child whenever the 6-digit value changes/pastes */
  private handleOtpComplete = (e: CustomEvent<string>) => {
    this.error = '';
    this.otp = e.detail;
  };

  private async verifyOtp() {
    if (this.otp.length < 6) return;

    this.isLoading = true;
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

  /** Allow the user to request a new OTP */
  private async resendOtp() {
    if (this.timer > 0) return;
    // you’d trigger your API here; then:
    this.timer = 60;
    this.startTimer();
  }

  // private onCancel = () => {
  //   this.otpFinished.emit('');
  //   this.closeModal();
  // };

  render() {
    return (
      <Host>
        <div ref={el => (this.modalRef = el as any)} class="modal fade" id="staticBackdrop" aria-hidden="true">
          <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title">Verify Your Identity</h5>
                {/* <button type="button" class="close" onClick={this.onCancel}>
                  <span aria-hidden="true">&times;</span>
                </button> */}
              </div>

              <div class="modal-body d-flex  flex-column">
                <p class="medium">Please enter the 6-digit code we just sent you.</p>
                <ir-otp
                  autoFocus
                  // value={this.otp}
                  onOtpComplete={this.handleOtpComplete}
                ></ir-otp>

                {this.error && <p class="text-danger small mt-1 p-0 mb-0">{this.error}</p>}

                {this.showResend && (
                  <p class="small mt-1">
                    {this.timer > 0 ? (
                      `Resend code in 00:${String(this.timer).padStart(2, '0')}`
                    ) : (
                      <a
                        href="#"
                        onClick={e => {
                          e.preventDefault();
                          this.resendOtp();
                        }}
                      >
                        Didn’t receive code? Resend
                      </a>
                    )}
                  </p>
                )}
              </div>

              <div class="modal-footer justify-content-auto">
                {/* <ir-button text="Cancel" btn_color="secondary" onClick={this.onCancel} btn_disabled={this.isLoading}></ir-button> */}
                <ir-button
                  class="w-100"
                  btn_styles={'flex-fill'}
                  text="Verify now"
                  isLoading={this.isLoading}
                  btn_disabled={this.otp.length < 6 || this.isLoading}
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
