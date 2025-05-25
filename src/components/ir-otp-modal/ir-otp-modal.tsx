import Token from '@/models/Token';
import { RoomService } from '@/services/room.service';
import { SystemService } from '@/services/system.service';
import locales from '@/stores/locales.store';
import { Component, Event, EventEmitter, Fragment, Host, Listen, Method, Prop, State, Watch, h } from '@stencil/core';
import { z } from 'zod';

@Component({
  tag: 'ir-otp-modal',
  styleUrl: 'ir-otp-modal.css',
  scoped: false,
})
export class IrOtpModal {
  @Prop() language: string = 'en';
  /** Number of seconds to wait before allowing OTP resend */
  @Prop() resendTimer = 60;

  /** URL or endpoint used to validate the OTP */
  @Prop() requestUrl: string;
  /** URL or endpoint used to validate the OTP */
  @Prop() baseOTPUrl: string;

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

  private dialogRef: HTMLDialogElement;

  private timerInterval: number;
  private systemService = new SystemService();
  private roomService = new RoomService();
  private tokenService = new Token();

  private otpVerificationSchema = z.object({ email: z.string().nonempty(), requestUrl: z.string().nonempty(), otp: z.string().length(this.otpLength) });

  /** Emits the final OTP (or empty on cancel) */
  @Event({ bubbles: true, composed: true }) otpFinished: EventEmitter<{
    otp: string;
    type: 'success' | 'cancelled';
  }>;
  @State() isInitializing: boolean;

  componentWillLoad() {
    if (this.ticket) {
      this.tokenService.setToken(this.ticket);
    }
    this.fetchLocale();
  }

  @Watch('ticket')
  handleTicketChange(newValue: string, oldValue: string) {
    if (newValue !== oldValue) {
      this.tokenService.setToken(newValue);
      this.fetchLocale();
    }
  }

  @Listen('keydown', { target: 'document' })
  handleKeyDownChange(e: KeyboardEvent) {
    if (e.key === 'Escape' && this.dialogRef?.open) {
      e.preventDefault();
    }
  }
  /** Open & reset everything */
  @Method()
  async openModal() {
    this.resetState();
    // $(this.modalRef).modal({ backdrop: 'static', keyboard: false });
    // $(this.modalRef).modal('show');
    if (typeof this.dialogRef.showModal === 'function') {
      this.dialogRef.showModal();
    } else {
      // fallback for browsers without dialog support
      this.dialogRef.setAttribute('open', '');
    }
    if (this.showResend) this.startTimer();
    await this.focusFirstInput();
  }

  /** Hide & clear timer */
  @Method()
  async closeModal() {
    // $(this.modalRef).modal('hide');
    if (typeof this.dialogRef.close === 'function') {
      this.dialogRef.close();
    } else {
      this.dialogRef.removeAttribute('open');
    }
    this.otp = null;
    this.clearTimer();
  }
  private async fetchLocale() {
    if (!this.tokenService.getToken()) {
      return;
    }
    this.isInitializing = true;
    await this.roomService.fetchLanguage(this.language, ['_USER_MGT']);
    this.isInitializing = false;
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
    const first = this.dialogRef.querySelector('input');
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
      this.otpFinished.emit({ otp: this.otp, type: 'success' });
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
  private handleCancelClicked() {
    if (this.baseOTPUrl === 'Check_OTP_Necessity') {
      this.closeModal();
      this.otpFinished.emit({
        otp: null,
        type: 'cancelled',
      });
      return;
    }
    window.location.reload();
  }
  disconnectedCallback() {
    this.clearTimer();
  }
  render() {
    return (
      <Host>
        <dialog ref={el => (this.dialogRef = el)} class="otp-modal" aria-modal="true">
          <form method="dialog" class="otp-modal-content">
            {this.isInitializing ? (
              <div class={'d-flex align-items-center justify-content-center modal-loading-container'}>
                <ir-spinner></ir-spinner>
              </div>
            ) : (
              <Fragment>
                <header class="otp-modal-header">
                  <h5 class="otp-modal-title">{locales.entries.Lcz_VerifyYourIdentity}</h5>
                </header>

                <section class="otp-modal-body d-flex align-items-center flex-column">
                  <p class="verification-message text-truncate">
                    {locales.entries.Lcz_WeSentYuoVerificationCode} {this.email}
                  </p>
                  <ir-otp autoFocus length={this.otpLength} defaultValue={this.otp} onOtpComplete={this.handleOtpComplete}></ir-otp>

                  {this.error && <p class="text-danger small mt-1 p-0 mb-0">{this.error}</p>}

                  {this.showResend && (
                    <Fragment>
                      {this.timer > 0 ? (
                        <p class="small mt-1">
                          {locales.entries.Lcz_ResendCode} 00:{String(this.timer).padStart(2, '0')}
                        </p>
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
                          text={'Didn’t receive code? Resend'}
                        ></ir-button>
                      )}
                    </Fragment>
                  )}
                </section>

                <footer class="otp-modal-footer justify-content-auto">
                  <ir-button class="w-100" btn_styles="flex-fill" text={locales.entries.Lcz_Cancel} btn_color="secondary" onClick={this.handleCancelClicked.bind(this)}></ir-button>
                  <ir-button
                    class="w-100"
                    btn_styles="flex-fill"
                    text={locales.entries.Lcz_VerifyNow}
                    isLoading={this.isLoading}
                    btn_disabled={this.otp?.length < this.otpLength || this.isLoading}
                    onClick={() => this.verifyOtp()}
                  ></ir-button>
                </footer>
              </Fragment>
            )}
          </form>
        </dialog>
      </Host>
    );
  }
}
