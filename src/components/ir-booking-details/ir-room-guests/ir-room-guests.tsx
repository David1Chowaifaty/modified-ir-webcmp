import { SharedPerson } from '@/models/booking.dto';
import { isRequestPending } from '@/stores/ir-interceptor.store';
import locales from '@/stores/locales.store';
import { Component, Event, EventEmitter, Fragment, Prop, State, h } from '@stencil/core';
import IMask from 'imask';
import moment from 'moment';

@Component({
  tag: 'ir-room-guests',
  styleUrl: 'ir-room-guests.css',
  scoped: true,
})
export class IrRoomGuests {
  @Prop() roomName: string;
  @Prop() sharedPersons: SharedPerson[] = [];
  @Prop() totalGuests: number = 0;

  @State() guests: SharedPerson[] = [];

  @Event() closeModal: EventEmitter<null>;
  @Event() resetbooking: EventEmitter<null>;

  // Default guest data
  private defaultGuest: SharedPerson = {
    id: -1,
    full_name: '',
    country_id: null,
    dob: '',
    id_info: {
      type: {
        code: '002',
        description: null,
      },
      number: '',
    },
    address: null,
    alternative_email: null,
    cci: null,
    city: null,
    country: undefined,
    country_phone_prefix: null,
    email: null,
    first_name: null,
    last_name: null,
    mobile: null,
    nbr_confirmed_bookings: 0,
    notes: null,
    password: null,
    subscribe_to_news_letter: null,
  };

  private dateMask = {
    mask: Date,
    pattern: 'DD/MM/YYYY',
    lazy: false,
    min: new Date(1970, 0, 1),
    max: new Date(),
    format: date => moment(date).format('DD/MM/YYYY'),
    parse: str => moment(str, 'DD/MM/YYYY').toDate(),
    blocks: {
      YYYY: {
        mask: IMask.MaskedRange,
        from: 1970,
        to: new Date().getFullYear(),
      },
      MM: {
        mask: IMask.MaskedRange,
        from: 1,
        to: 12,
      },
      DD: {
        mask: IMask.MaskedRange,
        from: 1,
        to: 31,
      },
    },
  };

  private initializeGuests(): void {
    let guests = [];
    if (this.totalGuests > this.sharedPersons.length) {
      const defaultGuestsCount = this.totalGuests - this.sharedPersons.length;
      guests = [...this.sharedPersons, ...Array(defaultGuestsCount).fill({ ...this.defaultGuest })];
    } else {
      guests = [...this.sharedPersons];
    }
    this.guests = guests.map(g => ({ ...g, dob: g.dob ? moment(new Date(g.dob)).format('DD/MM/YYYY') : '' }));
  }

  componentWillLoad() {
    this.initializeGuests();
  }

  private updateGuestInfo(index: number, params: Partial<SharedPerson>) {
    const tempGuests = [...this.guests];
    let tempGuest = tempGuests[index];
    tempGuest = { ...tempGuest, ...params };
    tempGuests[index] = tempGuest;
    this.guests = [...tempGuests];
  }

  render() {
    return (
      <div style={{ minWidth: '300px' }}>
        <ir-title class="px-1" onCloseSideBar={() => this.closeModal.emit(null)} label={`Room ${this.roomName}`} displayContext="sidebar"></ir-title>
        <section class={'px-1'}>
          <table>
            <thead>
              <th>Main Guest</th>
              <th>D.O.B.</th>
              <th>Nationality</th>
              <th>Passport or ID number</th>
            </thead>
            <tbody>
              {this.guests.map((guest, idx) => (
                <Fragment>
                  {idx === 1 && (
                    <tr>
                      <td colSpan={4}>Persons sharing room</td>
                    </tr>
                  )}
                  <tr key={idx}>
                    <td>
                      <ir-input-text
                        LabelAvailable={false}
                        placeholder=""
                        onTextChange={e => this.updateGuestInfo(idx, { full_name: e.detail })}
                        value={guest.full_name}
                      ></ir-input-text>
                    </td>
                    <td>
                      <ir-input-text
                        mask={this.dateMask}
                        LabelAvailable={false}
                        placeholder="dd/mm/yyyy"
                        onTextChange={e => {
                          this.updateGuestInfo(idx, { dob: e.detail });
                        }}
                        value={guest.dob}
                      ></ir-input-text>
                    </td>
                    <td>
                      <ir-input-text
                        LabelAvailable={false}
                        placeholder=""
                        onTextChange={e => this.updateGuestInfo(idx, { country_id: e.detail })}
                        value={guest.country_id}
                      ></ir-input-text>
                    </td>
                    <td class="input-group">
                      <div class="input-group-prepend py-0 my-0 bg-yellow">
                        <ir-button
                          btn_color="secondary"
                          btn_styles="dropdown-toggle"
                          text={guest.id_info.type.description}
                          size="sm"
                          data-toggle="dropdown"
                          aria-haspopup="true"
                          aria-expanded="false"
                        ></ir-button>
                        <div class="dropdown-menu my-0 bg-green">
                          <button
                            class="dropdown-item"
                            onClick={() => {
                              this.updateGuestInfo(idx, {
                                id_info: {
                                  ...this.guests[idx].id_info,
                                  type: {
                                    code: '001',
                                    description: 'test',
                                  },
                                },
                              });
                            }}
                          >
                            Action
                          </button>
                        </div>
                      </div>
                      <input
                        type="text"
                        value={guest.id_info.number}
                        onInput={e =>
                          this.updateGuestInfo(idx, {
                            id_info: {
                              ...this.guests[idx].id_info,
                              number: (e.target as HTMLInputElement).value,
                            },
                          })
                        }
                        class="form-control input-sm  my-0"
                        aria-label="Text input with dropdown button"
                      />
                    </td>
                  </tr>
                </Fragment>
              ))}
            </tbody>
          </table>
          <div class={'d-flex flex-column flex-sm-row mt-3'}>
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
              // onClick={this.saveAmenity.bind(this)}
            ></ir-button>
          </div>
        </section>
      </div>
    );
  }
}
