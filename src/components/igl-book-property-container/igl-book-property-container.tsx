import { IglBookPropertyPayloadPlusBooking } from '@/models/igl-book-property';
import Token from '@/models/Token';
import { BookingService } from '@/services/booking.service';
import { RoomService } from '@/services/room.service';
import locales from '@/stores/locales.store';
import { Component, Host, State, h, Prop, Watch, Event, EventEmitter, Fragment } from '@stencil/core';

@Component({
  tag: 'igl-book-property-container',
  styleUrl: 'igl-book-property-container.css',
  scoped: true,
})
export class IglBookPropertyContainer {
  @Prop() language: string = '';
  @Prop() ticket: string = '';
  @Prop() p: string;
  @Prop() propertyid: number;
  @Prop() from_date: string;
  @Prop() to_date: string;
  @Prop() withIrToastAndInterceptor: boolean = true;

  @State() bookingItem: IglBookPropertyPayloadPlusBooking | null;
  @State() showPaymentDetails: any;
  @State() countryNodeList: any;
  @State() calendarData: any = {};

  @Event() resetBookingData: EventEmitter<null>;

  private bookingService = new BookingService();
  private roomService = new RoomService();
  private token = new Token();

  setRoomsData(roomServiceResp) {
    let roomsData: { [key: string]: any }[] = new Array();
    if (roomServiceResp.My_Result?.roomtypes?.length) {
      roomsData = roomServiceResp.My_Result.roomtypes;
      roomServiceResp.My_Result.roomtypes.forEach(roomCategory => {
        roomCategory.expanded = true;
      });
    }
    this.calendarData.roomsInfo = roomsData;
  }
  async initializeApp() {
    try {
      if (!this.propertyid && !this.p) {
        throw new Error('Property ID or username is required');
      }
      const [roomResponse, languageTexts, countriesList] = await Promise.all([
        this.roomService.getExposedProperty({ id: this.propertyid, language: this.language, aname: this.p }),
        this.roomService.fetchLanguage(this.language),
        this.bookingService.getCountries(this.language),
      ]);
      if (!locales.entries) {
        locales.entries = languageTexts.entries;
        locales.direction = languageTexts.direction;
      }
      this.countryNodeList = countriesList;

      const { allowed_payment_methods: paymentMethods, currency, allowed_booking_sources, adult_child_constraints, calendar_legends } = roomResponse['My_Result'];
      this.calendarData = { currency, allowed_booking_sources, adult_child_constraints, legendData: calendar_legends };
      this.setRoomsData(roomResponse);
      const paymentCodesToShow = ['001', '004'];
      this.showPaymentDetails = paymentMethods.some(method => paymentCodesToShow.includes(method.code));
    } catch (error) {
      console.error('Error initializing app:', error);
    }
  }
  componentWillLoad() {
    if (this.ticket !== '') {
      this.token.setToken(this.ticket);
      this.initializeApp();
    }
  }
  @Watch('ticket')
  async ticketChanged() {
    this.token.setToken(this.ticket);
    this.initializeApp();
  }
  handleCloseBookingWindow() {
    this.bookingItem = null;
  }
  handleTriggerClicked() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    (this.bookingItem as IglBookPropertyPayloadPlusBooking) = {
      FROM_DATE: this.from_date,
      defaultDateRange: {
        fromDate: new Date(),
        fromDateStr: '',
        toDate: tomorrow,
        toDateStr: '',
        dateDifference: 0,
        message: '',
      },
      TO_DATE: this.to_date,
      EMAIL: '',
      event_type: 'PLUS_BOOKING',
      ID: '',
      NAME: '',
      PHONE: '',
      REFERENCE_TYPE: '',
      TITLE: locales.entries.Lcz_NewBooking,
    };
  }
  render() {
    return (
      <Host>
        {this.withIrToastAndInterceptor && (
          <Fragment>
            <ir-toast></ir-toast>
            <ir-interceptor></ir-interceptor>
          </Fragment>
        )}

        <div class="book-container" onClick={this.handleTriggerClicked.bind(this)}>
          <slot name="trigger"></slot>
        </div>
        {this.bookingItem && (
          <igl-book-property
            allowedBookingSources={this.calendarData.allowed_booking_sources}
            adultChildConstraints={this.calendarData.adult_child_constraints}
            showPaymentDetails={this.showPaymentDetails}
            countryNodeList={this.countryNodeList}
            currency={this.calendarData.currency}
            language={this.language}
            propertyid={this.propertyid}
            bookingData={this.bookingItem}
            onResetBookingData={(e: CustomEvent) => {
              e.stopImmediatePropagation();
              e.stopPropagation();
              this.resetBookingData.emit(null);
            }}
            onCloseBookingWindow={() => this.handleCloseBookingWindow()}
          ></igl-book-property>
        )}
      </Host>
    );
  }
}
