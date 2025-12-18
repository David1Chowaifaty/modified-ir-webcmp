import { SharedPerson, validateSharedPerson, ZSharedPerson } from '@/models/booking.dto';

import locales from '@/stores/locales.store';
import { Component, Event, EventEmitter, Fragment, Prop, State, h } from '@stencil/core';
import moment from 'moment';
import { dateMask, defaultGuest } from '../data';
import { BookingService } from '@/services/booking-service/booking.service';
import { ICountry, IEntries } from '@/models/IBooking';
import { ZodError } from 'zod';
@Component({
  tag: 'ir-room-guests-form',
  styleUrl: 'ir-room-guests-form.css',
  scoped: true,
})
export class IrRoomGuestsForm {
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

  @Event({ composed: true, bubbles: true }) closeModal: EventEmitter<null>;
  @Event({ composed: true, bubbles: true }) resetBookingEvt: EventEmitter<null>;
  @Event({ composed: true, bubbles: true }) updateRoomGuests: EventEmitter<{ identifier: string; guests: SharedPerson[] }>;

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
      console.log({
        sharedPersons: this.sharedPersons,
        guests: this.guests,
      });
      // ZSharedPersons.parse(this.guests);
      for (const guest of this.guests) {
        validateSharedPerson(guest);
      }
      await this.bookingService.handleExposedRoomGuests({
        booking_nbr: this.bookingNumber,
        identifier: this.identifier,
        guests: this.guests
          .map(g => {
            if (!g.first_name && g.id === -1) {
              return null;
            }
            return { ...g, dob: g.dob ? moment(g.dob, 'DD/MM/YYYY').format('YYYY-MM-DD') : null };
          })
          .filter(Boolean),
      });
      if (this.checkIn) {
        await this.bookingService.handleExposedRoomInOut({
          booking_nbr: this.bookingNumber,
          room_identifier: this.identifier,
          status: '001',
        });
      }
      this.closeModal.emit(null);
      this.updateRoomGuests.emit({ identifier: this.identifier, guests: this.guests });
      this.resetBookingEvt.emit();
    } catch (error) {
      console.log(error);
      if (error instanceof ZodError) {
        let errors = {};
        error.issues.forEach(e => {
          errors[e.path[e.path.length - 1]] = true;
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
        id={`room-guests__${this.identifier}`}
        class="sheet-container"
        style={{ minWidth: '300px' }}
        onSubmit={e => {
          e.preventDefault();
          this.saveGuests();
        }}
      >
        <section class={'sheet-body'}>
          <div class="">
            <div class="guest-grid guests-labels">
              <p class="">{locales.entries.Lcz_MainGuest}</p>
              <p class=""></p>
              <p class=" ">{locales.entries.Lcz_DOB}</p>
              <p class="">{locales.entries.Lcz_Nationality}</p>
              <p class=" ">{locales.entries.Lcz_Documents}</p>
            </div>
            <h5 class="main_guest_heading">{locales.entries.Lcz_MainGuest}</h5>
            {this.guests.map((guest, idx) => {
              let isRowValid = true;
              try {
                validateSharedPerson(guest);
              } catch (error) {
                isRowValid = false;
              }
              // console.log(`row ${idx}=>${isRowValid}`);
              return (
                <Fragment>
                  {idx === 1 && (
                    <div class="d-flex mx-0 px-0">
                      <h5 class="mx-0 px-0 sharing_persons_heading">{locales.entries.Lcz_PersonsSharingRoom}</h5>
                      <p class="mx-0 px-0 sharing_persons_label">{locales.entries.Lcz_PersonsSharingRoom}</p>
                    </div>
                  )}
                  <div key={idx} class="guest-grid">
                    <div class="room-guest__section">
                      <label htmlFor={`first_name_${idx}`} class="guest_label">
                        First name
                      </label>
                      <ir-validator class="flex-grow-1" schema={ZSharedPerson.shape.first_name}>
                        <ir-input
                          aria-invalid={String(!!this.error['first_name'] && !isRowValid)}
                          size="small"
                          id={`first_name_${idx}`}
                          placeholder="First name"
                          onText-change={e => this.updateGuestInfo(idx, { first_name: e.detail })}
                          value={guest.first_name}
                          maxlength={40}
                        ></ir-input>
                      </ir-validator>
                    </div>
                    <div class="room-guest__section">
                      <label class="guest_label">Last name</label>
                      {/* <ir-validator class="flex-grow-1" schema={ZSharedPerson.shape.last_name}> */}
                      <ir-input
                        aria-invalid={String(!!this.error['last_name'] && !isRowValid)}
                        size="small"
                        id={`last_name_${idx}`}
                        placeholder="Last name"
                        onText-change={e => this.updateGuestInfo(idx, { last_name: e.detail })}
                        value={guest.last_name}
                        maxlength={40}
                      ></ir-input>
                      {/* </ir-validator> */}
                    </div>
                    <div class="room-guest__section">
                      <p class="guest_label">{locales.entries.Lcz_DOB}</p>
                      <ir-validator class="flex-grow-1" schema={ZSharedPerson.shape.dob}>
                        <ir-input
                          aria-invalid={String(!!this.error['dob'] && !isRowValid)}
                          id={`dob_${idx}`}
                          mask={dateMask}
                          size="small"
                          placeholder=""
                          onText-change={e => {
                            this.updateGuestInfo(idx, { dob: e.detail });
                          }}
                          value={guest.dob}
                        ></ir-input>
                      </ir-validator>
                    </div>
                    <div class="room-guest__section">
                      <p class="guest_label">{locales.entries.Lcz_Nationality}</p>
                      <div class="flex-grow-1">
                        <ir-country-picker
                          size="small"
                          variant="modern"
                          aria-invalid={String(!!this.error['country_id'] && !guest.country_id)}
                          propertyCountry={this.propertyCountry}
                          id={`{locales.entries.Lcz_Nationality}_${idx}`}
                          error={!!this.error['country_id'] && !guest.country_id}
                          country={this.countries?.find(c => c.id?.toString() === guest.country?.id?.toString())}
                          onCountryChange={e => this.updateGuestInfo(idx, { country_id: e.detail?.id?.toString() ?? null, country: e.detail })}
                          countries={this.countries}
                        ></ir-country-picker>
                      </div>
                    </div>
                    <div class="room-guest__section">
                      <p class="guest_label">{locales.entries.Lcz_Documents}</p>
                      <div class={'room-guest__info-container flex-grow-1'}>
                        <wa-select
                          class="room-guest__id-info"
                          defaultValue={guest.id_info?.type?.code ?? this.idTypes[0]?.CODE_NAME}
                          value={guest.id_info?.type?.code}
                          onchange={e => {
                            this.updateGuestInfo(idx, {
                              id_info: {
                                ...this.guests[idx].id_info,
                                type: {
                                  code: (e.target as any).value,
                                  description: '',
                                },
                              },
                            });
                          }}
                          size="small"
                        >
                          {this.idTypes?.map(t => {
                            const label = t[`CODE_VALUE_${this.language.toUpperCase()}`] ?? t[`CODE_VALUE_EN`];
                            return (
                              <wa-option value={t['CODE_NAME']} label={label}>
                                {label}
                              </wa-option>
                            );
                          })}
                        </wa-select>
                        <wa-input
                          size="small"
                          aria-invalid={String(!!this.error['number'] && !isRowValid)}
                          class="room-guest__document"
                          defaultValue={guest?.id_info?.number}
                          value={guest?.id_info?.number}
                          maxlength={18}
                          placeholder="12345"
                          onchange={e =>
                            this.updateGuestInfo(idx, {
                              id_info: {
                                ...this.guests[idx].id_info,
                                number: (e.target as any).value,
                              },
                            })
                          }
                        ></wa-input>
                      </div>
                    </div>
                  </div>
                </Fragment>
              );
            })}
          </div>
        </section>
      </form>
    );
  }
}
