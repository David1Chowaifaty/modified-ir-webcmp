import { Component, h, Prop, EventEmitter, Event, Listen, State } from '@stencil/core';
import { _formatAmount, _formatDate, _getDay } from '../functions';
import { IUnit, Room } from '../../../models/booking.dto';

@Component({
  tag: 'ir-room',
  styleUrl: 'ir-room.css',
})
export class IrRoom {
  // Room Data
  @Prop() item: Room;
  // Meal Code names
  @Prop() mealCodeName: string;
  @Prop() myRoomTypeFoodCat: string;
  // Currency
  @Prop() currency: string = 'USD';
  @State() collapsed: boolean = false;

  // Booleans Conditions
  @Prop() hasRoomEdit: boolean = false;
  @Prop() hasRoomDelete: boolean = false;
  @Prop() hasRoomAdd: boolean = false;
  @Prop() hasCheckIn: boolean = false;
  @Prop() hasCheckOut: boolean = false;

  // Event Emitters
  @Event({ bubbles: true, composed: true }) pressCheckIn: EventEmitter;
  @Event({ bubbles: true, composed: true }) pressCheckOut: EventEmitter;

  @Listen('clickHanlder')
  handleClick(e) {
    let target = e.target;
    if (target.id == 'checkin') {
      this.pressCheckIn.emit(this.item);
    } else if (target.id == 'checkout') {
      this.pressCheckOut.emit(this.item);
    }
  }

  // _getFoodArrangeCat(catCode: string) {
  //   // get the category from the foodArrangeCats array
  //   const cat = this.mealCode.find((cat: any) => cat.CODE_NAME === catCode);
  //   // return the category
  //   return cat.CODE_VALUE_EN;
  // }

  render() {
    return (
      <div class="p-1 d-flex">
        <ir-icon
          id="drawer-icon"
          icon={`${this.collapsed ? 'ft-eye-off' : 'ft-eye'} h2 color-ir-dark-blue-hover`}
          data-toggle="collapse"
          data-target={`#roomCollapse-${this.item.identifier}`}
          aria-expanded="false"
          aria-controls="myCollapse"
          class="sm-padding-right pointer"
          onClick={() => {
            this.collapsed = !this.collapsed;
          }}
        ></ir-icon>
        <div class="w-100">
          <div class="d-flex justify-content-between">
            <div>
              <strong>{this.mealCodeName || ''} </strong> {this.myRoomTypeFoodCat} - {this.item.rateplan.is_non_refundable ? 'Refundable' : 'Non-refundable'}{' '}
              {/*this.item.My_Room_type.My_Room_type_desc[0].CUSTOM_TXT || ''*/}
            </div>
            <div>
              {/* <span class="mr-1">{this.item.TOTAL_AMOUNT + this.item.EXCLUDED_TAXES}</span> */}
              <span class="mr-1">{_formatAmount(this.item.total, this.currency)}</span>
              {this.hasRoomEdit && <ir-icon id={`roomEdit-${this.item.identifier}`} icon="ft-edit color-ir-dark-blue-hover h4 pointer"></ir-icon>}
              {this.hasRoomDelete && <ir-icon id={`roomDelete-${this.item.identifier}`} icon="ft-trash-2 danger h4 pointer"></ir-icon>}
            </div>
          </div>
          <div>
            <span class="mr-1">{`${this.item.guest.first_name || ''} ${this.item.guest.last_name || ''}`}</span>
            {this.item.rateplan.selected_variation.adult_nbr > 0 && (
              <span>
                {' '}
                {this.item.rateplan.selected_variation.adult_nbr} {this.item.rateplan.selected_variation.adult_nbr > 1 ? 'Adults' : 'Adult'}
              </span>
            )}
            {this.item.rateplan.selected_variation.child_nbr > 0 && (
              <span>
                {' '}
                {this.item.rateplan.selected_variation.child_nbr} {this.item.rateplan.selected_variation.child_nbr > 1 ? 'Children' : 'Child'}
              </span>
            )}
          </div>
          <div class="d-flex align-items-center">
            <span class=" mr-1">
              {_formatDate(this.item.from_date)} - {_formatDate(this.item.to_date)}
            </span>
            {this.item.unit && <span class="light-blue-bg mr-2 ">{(this.item.unit as IUnit).name}</span>}
            {this.hasCheckIn && <ir-button id="checkin" icon="" class="mr-1" btn_color="info" size="sm" text="Check in"></ir-button>}
            {this.hasCheckOut && <ir-button id="checkout" icon="" btn_color="info" size="sm" text="Check out"></ir-button>}
          </div>
          {/* <div class="collapse" id={`roomCollapse-${this.item.identifier}`}> */}
          <div class="d-flex">
            <div class=" sm-padding-top">
              <strong class="sm-padding-right">Rate Breakdown:</strong>
            </div>
            <div class="sm-padding-top w-100 ">
              {this.item.days.length > 0 &&
                this.item.days.map(item => (
                  <div class="fluid-container">
                    <div class="row">
                      <div class="col-xl-2 col-lg-3 col-md-2 col-sm-3 col-7 pr-0">{_getDay(item.date)}</div>{' '}
                      <div class="col-1 px-0 d-flex justify-content-end">{_formatAmount(item.amount, this.currency)}</div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
          <div innerHTML={this.item.rateplan.cancelation || ''}></div>
          {/* <ir-label label="PrePayment:" value={this.item.My_Room_type.My_Translated_Prepayment_Policy || ''}></ir-label>
            <ir-label label="Smoking Preference:" value={this.item.My_Room_type.My_Translated_Cancelation_Policy || ''}></ir-label> */}
          {/* <ir-label label="Meal Plan:" value={this.mealCodeName}></ir-label>*/}
          <ir-label label="Special rate:" value="Non-refundable"></ir-label>
        </div>
        {/* </div> */}
      </div>
    );
  }
}
