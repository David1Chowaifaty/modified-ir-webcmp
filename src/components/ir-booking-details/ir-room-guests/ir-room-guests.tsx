import { SharedPerson, ZIdInfo, ZSharedPerson, ZSharedPersons } from '@/models/booking.dto';
import { isRequestPending } from '@/stores/ir-interceptor.store';
import locales from '@/stores/locales.store';
import { Component, Event, EventEmitter, Fragment, Prop, State, h } from '@stencil/core';
import moment from 'moment';
import { dateMask, defaultGuest } from './data';
import { BookingService } from '@/services/booking.service';
import { ICountry, IEntries } from '@/models/IBooking';
import { ZodError } from 'zod';
@Component({
  tag: 'ir-room-guests',
  styleUrls: ['ir-room-guests.css', '../../../common/sheet.css'],
  scoped: true,
})
export class IrRoomGuests {
  /**
   * The name of the room currently being displayed.
   * Used to label the room in the user interface for clarity.
   */
  @Prop() roomName: string;

  /**
   * A unique identifier for the room.
   * This is used to distinguish between rooms, especially when performing operations like saving or checking in guests.
   */
  @Prop() identifier: string;

  /**
   * An array of people sharing the room.
   * Contains information about the {locales.entries.Lcz_MainGuest} and additional guests, such as their name, date of birth, {locales.entries.Lcz_Nationality}, and ID details.
   */
  @Prop() sharedPersons: SharedPerson[] = [];

  /**
   * The total number of guests for the room.
   * Determines how many guest input forms to display in the UI.
   */
  @Prop() totalGuests: number = 0;

  /**
   * A list of available countries.
   * Used to populate dropdowns for selecting the {locales.entries.Lcz_Nationality} of guests.
   */
  @Prop() countries: ICountry[];

  /**
   * A boolean indicating whether the room is in the process of being checked in.
   * If true, additional actions like saving the room state as "checked in" are performed.
   */
  @Prop() checkIn: boolean;

  /**
   * The language used for displaying text content in the component.
   * Defaults to English ('en'), but can be set to other supported languages.
   */
  @Prop() language: string = 'en';

  /**
   * A unique booking number associated with the room.
   * This is used for backend operations like saving guest information or checking in the room.
   */
  @Prop() bookingNumber: string;

  @State() guests: SharedPerson[] = [];
  @State() idTypes: IEntries[] = [];
  @State() error: Record<string, boolean> = {};
  @State() isLoading: boolean;
  @State() propertyCountry: ICountry;
  @State() autoValidate = false;

  @Event() closeModal: EventEmitter<null>;
  @Event() resetBookingEvt: EventEmitter<null>;
  @Event() updateRoomGuests: EventEmitter<{ identifier: string; guests: SharedPerson[] }>;

  private bookingService = new BookingService();

  componentWillLoad() {
    this.init();
    this.initializeGuests();
  }

  private async init() {
    try {
      this.isLoading = true;
      const [country, idTypes] = await Promise.all([this.bookingService.getUserDefaultCountry(), this.bookingService.getSetupEntriesByTableName('_ID_TYPE')]);
      this.idTypes = idTypes;
      if (country) {
        this.propertyCountry = this.countries.find(c => c.id === country.COUNTRY_ID);
      }
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
    this.guests = guests.map(g => ({ ...g, dob: g.dob ? moment(new Date(g.dob)).format('DD/MM/YYYY') : '', country_id: g.country ? g.country.id : null }));
  }

  private updateGuestInfo(index: number, params: Partial<SharedPerson>) {
    const tempGuests = [...this.guests];
    let tempGuest = tempGuests[index];
    tempGuest = { ...tempGuest, ...params };
    tempGuests[index] = tempGuest;
    this.guests = [...tempGuests];
  }

  private async saveGuests() {
    try {
      this.error = {};
      this.autoValidate = true;
      console.log(this.guests);
      ZSharedPersons.parse(this.guests);

      // await this.bookingService.handleExposedRoomGuests({
      //   booking_nbr: this.bookingNumber,
      //   identifier: this.identifier,
      //   guests: this.guests.map(g => ({ ...g, dob: g.dob ? moment(g.dob, 'DD/MM/YYYY').format('YYYY-MM-DD') : null })),
      // });
      // if (this.checkIn) {
      //   await this.bookingService.handleExposedRoomInOut({
      //     booking_nbr: this.bookingNumber,
      //     room_identifier: this.identifier,
      //     status: '001',
      //   });
      // }
      // this.closeModal.emit(null);
      // this.updateRoomGuests.emit({ identifier: this.identifier, guests: this.guests });
      // this.resetBookingEvt.emit();
    } catch (error) {
      console.log(error);
      if (error instanceof ZodError) {
        let errors = {};
        error.issues.forEach(e => {
          errors[e.path[1]] = true;
        });
        this.error = { ...errors };
      }
    }
  }

  render() {
    if (this.isLoading) {
      return (
        <div class={'loading-container'}>
          <ir-spinner></ir-spinner>
        </div>
      );
    }
    return (
      <form
        class="sheet-container"
        style={{ minWidth: '300px' }}
        onSubmit={e => {
          e.preventDefault();
          this.saveGuests();
        }}
      >
        <ir-title class="px-1 sheet-header" onCloseSideBar={() => this.closeModal.emit(null)} label={`Room ${this.roomName}`} displayContext="sidebar"></ir-title>
        <section class={'sheet-body px-1'}>
          <div class="">
            <div class="guest-grid guests-labels">
              <p class="">{locales.entries.Lcz_MainGuest}</p>
              <p class=""></p>
              <p class=" ">{locales.entries.Lcz_DOB}</p>
              <p class="">{locales.entries.Lcz_Nationality}</p>
              <p class=" ">{locales.entries.Lcz_Documents}</p>
            </div>
            <h5 class="main_guest_heading">{locales.entries.Lcz_MainGuest}</h5>
            {this.guests.map((guest, idx) => (
              <Fragment>
                {idx === 1 && (
                  <div class="d-flex mx-0 px-0">
                    <h5 class="mx-0 px-0 sharing_persons_heading">{locales.entries.Lcz_PersonsSharingRoom}</h5>
                    <p class="mx-0 px-0 sharing_persons_label">{locales.entries.Lcz_PersonsSharingRoom}</p>
                  </div>
                )}
                <div key={idx} class="guest-grid">
                  <div class={'m-0 p-0 d-flex align-items-center h-100'}>
                    <p class="guest_label">First name</p>
                    <ir-input-text
                      class="flex-grow-1 h-100"
                      id={`first_name_${idx}`}
                      zod={ZSharedPerson.pick({ first_name: true })}
                      error={!!this.error['first_name']}
                      autoValidate={this.autoValidate}
                      wrapKey="first_name"
                      placeholder="First name"
                      onTextChange={e => this.updateGuestInfo(idx, { first_name: e.detail })}
                      value={guest.first_name}
                      maxLength={40}
                    ></ir-input-text>
                  </div>
                  <div class={'m-0 p-0 d-flex align-items-center h-100'}>
                    <p class="guest_label">Last name</p>
                    <ir-input-text
                      maxLength={40}
                      class="flex-grow-1 h-100"
                      id={`last_name_${idx}`}
                      zod={ZSharedPerson.pick({ last_name: true })}
                      error={!!this.error['last_name']}
                      autoValidate={this.autoValidate}
                      wrapKey="last_name"
                      placeholder="Last name"
                      onTextChange={e => this.updateGuestInfo(idx, { last_name: e.detail })}
                      value={guest.last_name}
                    ></ir-input-text>
                  </div>
                  <div class="flex-grow-0 m-0 p-0 h-100 d-flex align-items-center">
                    <p class="guest_label">{locales.entries.Lcz_DOB}</p>
                    <ir-input-text
                      class="flex-grow-1 h-100"
                      id={`dob_${idx}`}
                      zod={ZSharedPerson.pick({ dob: true })}
                      error={!!this.error['dob']}
                      autoValidate={this.autoValidate}
                      wrapKey="dob"
                      mask={dateMask}
                      placeholder=""
                      onTextChange={e => {
                        this.updateGuestInfo(idx, { dob: e.detail });
                      }}
                      value={guest.dob}
                    ></ir-input-text>
                  </div>
                  <div class=" m-0 p-0 d-flex align-items-center">
                    <p class="guest_label">{locales.entries.Lcz_Nationality}</p>
                    <div class="mx-0 flex-grow-1  h-100">
                      <ir-country-picker
                        class="h-100"
                        propertyCountry={this.propertyCountry}
                        id={`{locales.entries.Lcz_Nationality}_${idx}`}
                        error={!!this.error['country_id'] && !guest.country_id}
                        country={this.countries?.find(c => c.id?.toString() === guest.country?.id?.toString())}
                        onCountryChange={e => this.updateGuestInfo(idx, { country_id: e.detail?.id?.toString() ?? null, country: e.detail })}
                        countries={this.countries}
                      ></ir-country-picker>
                    </div>
                  </div>
                  <div class="flex-grow-1 m-0 p-0 d-flex align-items-center">
                    <p class="guest_label">{locales.entries.Lcz_Documents}</p>
                    <div class={' d-flex m-0 flex-grow-1 h-100'}>
                      <ir-select
                        selectForcedStyles={{
                          borderTopRightRadius: '0px',
                          borderBottomRightRadius: '0px',
                          borderRight: '0',
                        }}
                        selectStyles={'rounded-top-0 rounded-bottom-0'}
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
                        LabelAvailable={false}
                        showFirstOption={false}
                        data={this.idTypes?.map(t => ({ text: t[`CODE_VALUE_${this.language.toUpperCase()}`] ?? t[`CODE_VALUE_EN`], value: t.CODE_NAME }))}
                      ></ir-select>
                      <ir-input-text
                        autoValidate={this.autoValidate}
                        maxLength={18}
                        placeholder="12345"
                        class="flex-grow-1 guest_document"
                        type="text"
                        inputForcedStyle={{ borderTopLeftRadius: '0px', borderBottomLeftRadius: '0px' }}
                        value={guest.id_info.number}
                        zod={ZIdInfo.pick({ number: true })}
                        error={!!this.error['number']}
                        wrapKey="number"
                        inputStyles="form-control"
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
        </section>
        <div class={'sheet-footer'}>
          <ir-button onClick={() => this.closeModal.emit(null)} class={`flex-fill`} text={locales.entries.Lcz_Cancel} btn_color="secondary"></ir-button>
          <ir-button
            btn_type="submit"
            class={'flex-fill'}
            isLoading={isRequestPending('/Handle_Exposed_Room_Guests')}
            text={this.checkIn ? locales.entries.Lcz_CheckIn : locales.entries.Lcz_Save}
            btn_color="primary"
          ></ir-button>
        </div>
      </form>
    );
  }
}
