import { Component, h, Prop, EventEmitter, Event, Listen, State } from '@stencil/core';
import { _formatAmount, _formatDate, _getDay } from '../functions';

@Component({
  tag: 'ir-room',
})
export class IrRoom {
  // Room Data
  @Prop() item: any;

  // Currency
  @Prop() currency: string = 'USD';
  @State() collapsed: boolean = false;
  // Statuses and Codes
  @Prop({ reflect: true }) mealCode: any;

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

  _getFoodArrangeCat(catCode: string) {
    // get the category from the foodArrangeCats array
    const cat = this.mealCode.find((cat: any) => cat.CODE_NAME === catCode);
    // return the category
    return cat.CODE_VALUE_EN;
  }

  render() {
    return (
      <div class="p-1 d-flex">
        <ir-icon
          id="drawer-icon"
          icon={`${this.collapsed ? 'ft-eye-off' : 'ft-eye'} h2 color-ir-dark-blue-hover`}
          data-toggle="collapse"
          data-target={`#roomCollapse-${this.item.BSA_ID}`}
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
              <strong>{this.item.My_Room_type.My_Room_category.NAME || ''} </strong> {this.mealCode && this._getFoodArrangeCat(this.item.My_Room_type.FOOD_ARRANGE_CAT_CODE)} -{' '}
              {this.item.My_Room_type.IS_NON_REFUNDABLE ? 'Refundable' : 'Non-refundable'} {this.item.My_Room_type.My_Room_type_desc[0].CUSTOM_TXT || ''}
            </div>
            <div>
              {/* <span class="mr-1">{this.item.TOTAL_AMOUNT + this.item.EXCLUDED_TAXES}</span> */}
              <span class="mr-1">{_formatAmount(this.item.TOTAL_AMOUNT, this.currency)}</span>
              {this.hasRoomEdit && <ir-icon id={`roomEdit-${this.item.BSA_ID}`} icon="ft-edit color-ir-dark-blue-hover h4 pointer"></ir-icon>}
              {this.hasRoomDelete && <ir-icon id={`roomDelete-${this.item.BSA_ID}`} icon="ft-trash-2 danger h4 pointer"></ir-icon>}
            </div>
          </div>
          <div>
            <span class="mr-1">{`${this.item.GUEST_FIRST_NAME || ''} ${this.item.GUEST_LAST_NAME || ''}`}</span>
            {this.item.ADULTS_NBR > 0 && (
              <span>
                {' '}
                {this.item.ADULTS_NBR} {this.item.ADULTS_NBR > 1 ? 'Adults' : 'Adult'}
              </span>
            )}
            {this.item.CHILD_NBR > 0 && (
              <span>
                {' '}
                {this.item.CHILD_NBR} {this.item.CHILD_NBR > 1 ? 'Children' : 'Child'}
              </span>
            )}
          </div>
          <div class="d-flex align-items-center">
            <span class=" mr-1">
              {_formatDate(this.item.FROM_DATE)} - {_formatDate(this.item.TO_DATE)}
            </span>
            {this.item.UNIT && <span class="light-blue-bg mr-2 ">{this.item.UNIT}</span>}
            {this.hasCheckIn && <ir-button id="checkin" icon="" class="mr-1" btn_color="info" size="sm" text="Check in"></ir-button>}
            {this.hasCheckOut && <ir-button id="checkout" icon="" btn_color="info" size="sm" text="Check out"></ir-button>}
          </div>
          <div class="collapse" id={`roomCollapse-${this.item.BSA_ID}`}>
            <div class="d-flex">
              <div class=" sm-padding-top">
                <strong class="sm-padding-right">Rate Breakdown:</strong>
              </div>
              <div class="sm-padding-top w-100 ">
                {this.item.My_Bsad.length > 0 &&
                  this.item.My_Bsad.map(item => (
                    <div class="fluid-container">
                      <div class="row">
                        <div class="col-xl-2 col-lg-3 col-md-2 col-sm-3 col-7 pr-0">{_getDay(item.ALLOTMENT_DATE)}</div>{' '}
                        <div class="col-1 px-0 d-flex justify-content-end">{_formatAmount(item.TOTAL_AMOUNT, this.currency)}</div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
            {/* <ir-label label="Cancelation:" value={this.item.CANCELATION_POLICY_PHRASE || ''}></ir-label> */}
            <div innerHTML={this.item.CANCELATION_POLICY_PHRASE || ''}></div>
            <ir-label label="PrePayment:" value={this.item.My_Room_type.My_Translated_Prepayment_Policy || ''}></ir-label>
            <ir-label label="Smoking Preference:" value={this.item.My_Room_type.My_Translated_Cancelation_Policy || ''}></ir-label>
            <ir-label label="Meal Plan:" value={this.mealCode && this._getFoodArrangeCat(this.item.FOOD_ARRANGE_CAT_CODE)}></ir-label>
            <ir-label label="Special rate:" value="Non-refundable"></ir-label>
          </div>
        </div>
      </div>
    );
  }
}
