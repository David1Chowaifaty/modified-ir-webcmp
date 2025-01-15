import { SharedPerson, ZIdInfo, ZSharedPerson, ZSharedPersons } from '@/models/booking.dto';
import { isRequestPending } from '@/stores/ir-interceptor.store';
import locales from '@/stores/locales.store';
import { Component, Event, EventEmitter, Fragment, Prop, State, h } from '@stencil/core';
import moment from 'moment';
import { dateMask, defaultGuest } from './data';
import { BookingService } from '@/services/booking.service';
import { ICountry, IEntries } from '@/models/IBooking';
@Component({
  tag: 'ir-room-guests',
  styleUrl: 'ir-room-guests.css',
  scoped: true,
})
export class IrRoomGuests {
  @Prop() roomName: string;
  @Prop() sharedPersons: SharedPerson[] = [];
  @Prop() totalGuests: number = 0;
  @Prop() countries: ICountry[];
  @Prop() language: string = 'en';

  @State() guests: SharedPerson[] = [];
  @State() idTypes: IEntries[] = [];
  @State() error: boolean = false;
  @State() isLoading: boolean;
  @State() submitted: boolean;

  @Event() closeModal: EventEmitter<null>;
  @Event() resetbooking: EventEmitter<null>;

  private bookingService = new BookingService();

  componentWillLoad() {
    this.init();
    this.initializeGuests();
  }

  private async init() {
    try {
      this.isLoading = true;
      this.idTypes = await this.bookingService.getSetupEntriesByTableName('_ID_TYPE');
    } catch (error) {
      console.error(error);
    } finally {
      this.isLoading = false;
    }
  }

  private initializeGuests(): void {
    let guests = [];
    if (this.totalGuests > this.sharedPersons.length) {
      const defaultGuestsCount = this.totalGuests - this.sharedPersons.length;
      guests = [
        ...this.sharedPersons,
        ...Array(defaultGuestsCount).fill({
          ...defaultGuest,
          id_info: {
            ...defaultGuest.id_info,
            type: {
              code: this.idTypes[0]?.CODE_NAME || '001',
              description: this.idTypes[0]?.CODE_VALUE_EN || '',
            },
            number: '',
          },
        }),
      ];
    } else {
      guests = [...this.sharedPersons];
    }
    guests = guests.map(g => ({ ...g, dob: new Date(g.dob).getFullYear() === 1900 ? null : g.dob }));
    this.guests = guests.map(g => ({ ...g, dob: g.dob ? moment(new Date(g.dob)).format('DD/MM/YYYY') : '' }));
  }

  private updateGuestInfo(index: number, params: Partial<SharedPerson>) {
    const tempGuests = [...this.guests];
    let tempGuest = tempGuests[index];
    tempGuest = { ...tempGuest, ...params };
    tempGuests[index] = tempGuest;
    this.guests = [...tempGuests];
  }

  private saveGuests() {
    try {
      this.submitted = true;
      this.error = false;

      ZSharedPersons.parse(this.guests);
    } catch (error) {
      console.log(error);
      this.error = true;
    }
  }

  render() {
    if (this.isLoading) {
      return null;
    }
    return (
      <div class="h-100 d-flex flex-column" style={{ minWidth: '300px' }}>
        <ir-title class="px-1" onCloseSideBar={() => this.closeModal.emit(null)} label={`Room ${this.roomName}`} displayContext="sidebar"></ir-title>
        <section class={'d-flex flex-column px-1 h-100 '}>
          <div class="h-100 flex-grow-1">
            <div class="guest-grid">
              <p class="">Main Guest</p>
              <p class=" ">D.O.B.</p>
              <p class="">Nationality</p>
              <p class=" ">Passport or ID number</p>
            </div>
            {this.guests.map((guest, idx) => (
              <Fragment>
                {idx === 1 && (
                  <div class="d-flex mx-0 px-0">
                    <p class="mx-0 px-0">Persons sharing room</p>
                  </div>
                )}
                <div key={idx} class="guest-grid">
                  <div class={'m-0 p-0'}>
                    <ir-input-text
                      zod={ZSharedPerson.pick({ full_name: true })}
                      error={this.error}
                      autoValidate={false}
                      wrapKey="full_name"
                      LabelAvailable={false}
                      submitted={this.submitted}
                      placeholder=""
                      onTextChange={e => this.updateGuestInfo(idx, { full_name: e.detail })}
                      value={guest.full_name}
                    ></ir-input-text>
                  </div>
                  <div class="flex-grow-0 m-0 p-0">
                    <ir-input-text
                      zod={ZSharedPerson.pick({ dob: true })}
                      error={this.error}
                      autoValidate={false}
                      wrapKey="dob"
                      submitted={this.submitted}
                      mask={dateMask}
                      LabelAvailable={false}
                      placeholder="dd/mm/yyyy"
                      onTextChange={e => {
                        this.updateGuestInfo(idx, { dob: e.detail });
                      }}
                      value={guest.dob}
                    ></ir-input-text>
                  </div>
                  <div class=" m-0 p-0">
                    <ir-country-picker
                      error={this.error && !guest.country_id}
                      country={this.countries?.find(c => c.id?.toString() === guest.country?.id?.toString())}
                      onCountryChange={e => this.updateGuestInfo(idx, { country_id: e.detail.id.toString(), country: e.detail })}
                      countries={this.countries}
                    ></ir-country-picker>
                  </div>
                  <div class=" flex-grow-1 m-0 p-0">
                    <div class={'input-group d-flex m-0'}>
                      <ir-select
                        selectStyles={'id-select'}
                        onSelectChange={e => {
                          this.updateGuestInfo(idx, {
                            id_info: {
                              ...this.guests[idx].id_info,
                              type: {
                                code: e.detail,
                                description: '',
                              },
                            },
                          });
                        }}
                        selectedValue={guest.id_info.type.code}
                        showFirstOption={false}
                        LabelAvailable={false}
                        data={this.idTypes?.map(t => ({ text: t[`CODE_VALUE_${this.language.toUpperCase()}`] ?? t[`CODE_VALUE_EN`], value: t.CODE_NAME }))}
                      ></ir-select>
                      <ir-input-text
                        type="text"
                        value={guest.id_info.number}
                        zod={ZIdInfo.pick({ number: true })}
                        error={this.error}
                        autoValidate={false}
                        wrapKey="number"
                        inputStyles="form-control"
                        submitted={this.submitted}
                        LabelAvailable={false}
                        onTextChange={e =>
                          this.updateGuestInfo(idx, {
                            id_info: {
                              ...this.guests[idx].id_info,
                              number: e.detail,
                            },
                          })
                        }
                      ></ir-input-text>
                    </div>
                  </div>
                </div>
              </Fragment>
            ))}
          </div>
          <div class={'d-flex flex-column flex-sm-row mt-3 action-buttons '}>
            <ir-button
              onClick={() => this.closeModal.emit(null)}
              btn_styles="justify-content-center"
              class={`mb-1 mb-sm-0 flex-fill mr-sm-1`}
              icon=""
              text={locales.entries.Lcz_Cancel}
              btn_color="secondary"
            ></ir-button>

            <ir-button
              btn_styles="justify-content-center align-items-center"
              class={'m-0 flex-fill text-center'}
              icon=""
              isLoading={isRequestPending('/Do_Booking_Extra_Service')}
              text={locales.entries.Lcz_Save}
              btn_color="primary"
              onClickHandler={this.saveGuests.bind(this)}
            ></ir-button>
          </div>
        </section>
      </div>
    );
  }
}
