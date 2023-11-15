import { Component, Element, Event, EventEmitter, Host, Listen, Prop, State, h } from '@stencil/core';

@Component({
  tag: 'igl-booking-event',
  styleUrl: 'igl-booking-event.css',
  scoped: true,
})
export class IglBookingEvent {
  @Element() private element: HTMLElement;
  @Prop() currency;
  @Prop() is_vacation_rental: boolean = false;
  @Event({ bubbles: true, composed: true }) hideBubbleInfo: EventEmitter;

  @Event() updateEventData: EventEmitter;
  @Event() dragOverEventData: EventEmitter;

  @Prop() bookingEvent: { [key: string]: any };
  @Prop() allBookingEvents: { [key: string]: any } = [];
  @Prop() countryNodeList;

  @State() renderElement: boolean = false;
  @State() position: { [key: string]: any };

  dayWidth: number = 0;
  eventSpace: number = 8;
  vertSpace: number = 10;

  /* show bubble */
  private showInfoPopup: boolean = false;
  private bubbleInfoTopSide: boolean = false;
  /* Resize props */
  resizeSide: string = '';
  isDragging: boolean = false;
  initialX: number;
  initialY: number;
  currentX: number;
  currentY: number;
  initialWidth: number;
  initialLeft: number;
  finalWidth: number;
  dragInitPos: { [key: string]: any };
  dragEndPos: { [key: string]: any };
  elementRect: { [key: string]: any };
  isTouchStart: boolean;
  moveDiffereneX: number;
  moveDiffereneY: number;

  handleMouseMoveBind = this.handleMouseMove.bind(this);
  handleMouseUpBind = this.handleMouseUp.bind(this);
  handleClickOutsideBind = this.handleClickOutside.bind(this);

  componentWillLoad() {
    window.addEventListener('click', this.handleClickOutsideBind);
  }

  componentDidLoad() {
    if (this.isNewEvent()) {
      if (!this.bookingEvent.hideBubble) {
        /* auto matically open the popup, calling the method shows bubble either top or bottom based on available space. */
        setTimeout(() => {
          this.showEventInfo(true);
          this.renderAgain();
        }, 1);
      }
    }
  }

  disconnectedCallback() {
    window.removeEventListener('click', this.handleClickOutsideBind);
  }

  @Listen('click', { target: 'window' })
  handleClickOutside(event: Event) {
    const clickedElement = event.target as HTMLElement;
    // Check if the clicked element is not within the target div
    if (!this.element.contains(clickedElement)) {
      // The click occurred outside the target div
      this.showEventInfo(false);
    }
  }

  @Listen('hideBubbleInfo', { target: 'window' })
  hideBubbleInfoPopup(event: CustomEvent) {
    if (event.detail.currentInfoBubbleId != this.getBookingId() || (event.detail.key === 'hidebubble' && event.detail.currentInfoBubbleId === this.getBookingId())) {
      this.showInfoPopup = false;
      this.renderAgain();
    }
  }

  @Listen('moveBookingTo', { target: 'window' })
  async moveBookingToHandler(event: CustomEvent) {
    try {
      if (event.detail.bookingId !== this.getBookingId()) {
        this.showEventInfo(false);
        return;
      }
      // event.detail.fromRoomId === this.getBookedRoomId() && ()
      if (event.detail.moveToDay === 'revert' || event.detail.toRoomId === 'revert') {
        event.detail.moveToDay = this.bookingEvent.FROM_DATE;
        event.detail.toRoomId = event.detail.fromRoomId;
        if (this.isTouchStart && this.moveDiffereneX <= 5 && this.moveDiffereneY <= 5) {
          this.showEventInfo(true);
        }
      } else {
        if (this.isTouchStart && this.moveDiffereneX <= 5 && this.moveDiffereneY <= 5) {
          this.showEventInfo(true);
        } else {
          const { pool, from_date, to_date, toRoomId } = event.detail as any;
          console.log(pool, from_date, to_date, toRoomId);
          // const result = await this.eventsService.reallocateEvent(
          //   pool,
          //   toRoomId,
          //   from_date,
          //   to_date
          // );
          //this.bookingEvent.POOL = result.My_Result.POOL;
          console.log(event.detail);
          console.log('calll update here');
        }
      }

      if (event.detail.fromRoomId === this.getBookedRoomId()) {
        // Temporarily set to some other title and revert it.. as refresh issue is happening when there minimum change in top / left.
        // this.onMoveUpdateBooking({ toRoomId: "X", moveToDay: "01_01_2023" });
        // this.renderAgain();
        // setTimeout(() => {
        // }, 20);
        this.onMoveUpdateBooking(event.detail);
        this.renderAgain();
      }
    } catch (error) {
      //  toastr.error(error);
    }
  }

  renderAgain() {
    this.renderElement = !this.renderElement;
  }

  getUniqueId() {
    return new Date().getTime();
  }

  onMoveUpdateBooking(data) {
    this.bookingEvent.PR_ID = data.toRoomId;
    this.bookingEvent.FROM_DATE = data.moveToDay.split('_').reverse().join('/');
    let tempDate = new Date(this.bookingEvent.FROM_DATE);
    tempDate.setDate(tempDate.getDate() + this.getStayDays());
    this.bookingEvent.TO_DATE = tempDate.getFullYear() + '/' + (tempDate.getMonth() + 1) + '/' + tempDate.getDate();
  }
  /* End of Resize props */

  isSplitBooking() {
    return !!this.bookingEvent.SPLIT_BOOKING;
  }

  isNewEvent() {
    return this.getBookingId() === 'NEW_TEMP_EVENT';
  }

  isHighlightEventType() {
    return this.getEventType() === 'HIGH_LIGHT';
  }

  getBookingId() {
    return this.bookingEvent.ID;
  }

  getBookingStatus() {
    return this.bookingEvent.STATUS;
  }

  getBookedBy() {
    return this.bookingEvent.NAME;
  }

  getBookedRoomId() {
    return this.bookingEvent.PR_ID;
  }

  getEventStartingDate() {
    return new Date(this.bookingEvent.FROM_DATE);
  }

  getEventEndingDate() {
    return new Date(this.bookingEvent.TO_DATE);
  }

  getEventType() {
    return this.bookingEvent.event_type;
  }

  getEventLegend() {
    // console.log(this.getBookingStatus());
    let status = this.bookingEvent?.legendData.statusId[this.getBookingStatus()];
    let orderRide = this.isNewEvent() ? { color: '#f9f9c9' } : {};
    return {
      ...this.bookingEvent?.legendData[status.id],
      ...status,
      ...orderRide,
    };
  }

  getLegendOfStatus(aStatusId) {
    // console.log(aStatusId);
    let status = this.bookingEvent?.legendData.statusId[aStatusId];
    return { ...this.bookingEvent.legendData[status.id], ...status };
  }

  getNoteNode() {
    if (this.bookingEvent.NOTES || this.bookingEvent.INTERNAL_NOTE) {
      return this.getLegendOfStatus('NOTES');
    }
    return null;
  }

  getBalanceNode() {
    if (this.bookingEvent.BALANCE) {
      return this.getLegendOfStatus('OUTSTANDING-BALANCE');
    }
    return null;
  }

  setStayDays(aStayDays: number) {
    this.bookingEvent.NO_OF_DAYS = aStayDays;
    this.renderAgain();
    // this.updateData({id: this.getBookedRoomId(), data: { NO_OF_DAYS: aStayDays }});
  }

  getStayDays() {
    return this.bookingEvent.NO_OF_DAYS;
  }

  getPosition() {
    let startingDate = this.getEventStartingDate();
    let startingCellClass = '.room_' + this.getBookedRoomId() + '_' + startingDate.getDate() + '_' + (startingDate.getMonth() + 1) + '_' + startingDate.getFullYear();
    let bodyContainer = document.querySelector('.bodyContainer');
    let startingCell = document.querySelector(startingCellClass);
    let pos = { top: '0', left: '0', width: '0', height: '20px' };
    if (startingCell && bodyContainer && startingCell.getBoundingClientRect() && bodyContainer.getBoundingClientRect()) {
      let bodyContainerRect = bodyContainer.getBoundingClientRect();
      let boundingRect = startingCell.getBoundingClientRect();
      this.dayWidth = this.dayWidth || boundingRect.width;
      pos.top = boundingRect.top + boundingRect.height / 2 - this.vertSpace - bodyContainerRect.top + 'px';
      pos.left = boundingRect.left + this.dayWidth / 2 + this.eventSpace / 2 - bodyContainerRect.left + 'px';
      pos.width = this.getStayDays() * this.dayWidth - this.eventSpace + 'px';
    } else {
      console.log('Locating event cell failed ', startingCellClass);
    }
    //console.log(pos);
    return pos;
  }

  getNumber(aData) {
    return aData ? parseFloat(aData) : 0;
  }

  startDragging(event: any, side: string) {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    if (this.isNewEvent() || this.isHighlightEventType()) {
      return null;
    }

    this.resizeSide = side;
    this.isDragging = true;

    this.showEventInfo(false); // Hide bubble;

    if (side === 'move') {
      this.initialX = event.clientX || event.touches[0].clientX;
      this.initialY = event.clientY || event.touches[0].clientY;
      this.elementRect = this.element.getBoundingClientRect();
      const offsetX = 0; //this.initialX - this.elementRect.left - 18;
      const offsetY = 0; // this.initialY - this.elementRect.top - (this.elementRect.height/2);
      this.dragInitPos = {
        id: this.getBookingId(),
        fromRoomId: this.getBookedRoomId(),
        top: this.getNumber(this.element.style.top) + offsetY,
        left: this.getNumber(this.element.style.left) + offsetX,
      };
      this.dragInitPos.x = this.dragInitPos.left; // + 18;
      this.dragInitPos.y = this.dragInitPos.top; // + (this.elementRect.height/2);
      this.dragEndPos = { ...this.dragInitPos };
      this.element.style.top = `${this.dragInitPos.top}px`;
      this.element.style.left = `${this.dragInitPos.left}px`;
      this.isTouchStart = true; // !!(event.touches && event.touches.length);
      this.dragOverEventData.emit({
        id: 'CALCULATE_DRAG_OVER_BOUNDS',
        data: this.dragInitPos,
      });
    } else {
      this.initialWidth = this.element.offsetWidth;
      this.initialLeft = this.element.offsetLeft;
      this.initialX = event.clientX || event.touches[0].clientX;
      this.dragOverEventData.emit({
        id: 'CALCULATE_DRAG_OVER_BOUNDS',
        data: {
          id: this.getBookingId(),
          fromRoomId: this.getBookedRoomId(),
          top: this.getNumber(this.element.style.top),
          left: this.initialLeft,
          x: this.initialX,
          y: event.clientY || event.touches[0].clientY,
        },
      });
    }

    document.addEventListener('mousemove', this.handleMouseMoveBind);
    document.addEventListener('touchmove', this.handleMouseMoveBind);
    document.addEventListener('pointermove', this.handleMouseMoveBind);

    document.addEventListener('mouseup', this.handleMouseUpBind);
    document.addEventListener('touchup', this.handleMouseUpBind);
    document.addEventListener('pointerup', this.handleMouseUpBind);
  }

  handleMouseMove(event: any) {
    if (this.isDragging) {
      this.currentX = event.clientX || event.touches[0].clientX;
      let distanceX = this.currentX - this.initialX;
      if (this.resizeSide === 'move') {
        this.currentY = event.clientY || event.touches[0].clientY;
        let distanceY = this.currentY - this.initialY;
        this.element.style.top = `${this.dragInitPos.top + distanceY}px`;
        this.element.style.left = `${this.dragInitPos.left + distanceX}px`;
        this.dragEndPos = {
          id: this.getBookingId(),
          fromRoomId: this.getBookedRoomId(),
          top: this.dragInitPos.top + distanceY,
          left: this.dragInitPos.left + distanceX,
        };
        this.dragEndPos.x = this.dragEndPos.left; // + 18;
        this.dragEndPos.y = this.dragEndPos.top; // + (this.elementRect.height/2);
        this.dragOverEventData.emit({ id: 'DRAG_OVER', data: this.dragEndPos });
      } else {
        let newWidth = this.initialWidth;
        if (this.resizeSide == 'rightSide') {
          newWidth = this.initialWidth + distanceX;
          newWidth = Math.min(newWidth, this.initialX + this.element.offsetWidth);
          newWidth = Math.max(this.dayWidth - this.eventSpace, newWidth);
          this.element.style.width = `${newWidth}px`;
        } else if (this.resizeSide == 'leftSide') {
          newWidth = Math.max(this.dayWidth - this.eventSpace, this.initialWidth - distanceX);
          let newLeft = this.initialLeft + (this.initialWidth - newWidth);
          this.element.style.left = `${newLeft}px`;
          this.element.style.width = `${newWidth}px`;
        }
        this.finalWidth = newWidth;
      }
    } else {
      console.log('still mouse move listening...');
    }
  }

  handleMouseUp() {
    if (this.isDragging) {
      if (this.resizeSide === 'move') {
        // console.log("Initial X::"+this.dragInitPos.x);
        // console.log("Initial Y::"+this.dragInitPos.y);
        // console.log("End X::"+this.dragEndPos.x);
        // console.log("End Y::"+this.dragEndPos.y);
        if (this.isTouchStart) {
          this.moveDiffereneX = Math.abs(this.dragEndPos.x - this.dragInitPos.x);
          this.moveDiffereneY = Math.abs(this.dragEndPos.y - this.dragInitPos.y);
        }
        this.dragOverEventData.emit({
          id: 'DRAG_OVER_END',
          data: {
            ...this.dragEndPos,
            pool: this.bookingEvent.POOL,
            nbOfDays: this.bookingEvent.NO_OF_DAYS,
          },
        });
      } else {
        let numberOfDays = Math.round(this.finalWidth / this.dayWidth);
        let initialStayDays = this.getStayDays();
        if (initialStayDays != numberOfDays) {
          this.setStayDays(numberOfDays);
          if (this.resizeSide == 'leftSide') {
            this.element.style.left = `${this.initialLeft + (initialStayDays - numberOfDays) * this.dayWidth}px`;
            // set FROM_DATE = TO_DATE - numberOfDays
          } else {
            // set TO_DATE = FROM_DATE + numberOfDays
          }
          this.dragOverEventData.emit({
            id: 'STRETCH_OVER_END',
            data: {
              id: this.getBookingId(),
              fromRoomId: +this.getBookedRoomId(),
              x: +this.element.style.left.replace('px', ''),
              y: +this.element.style.top.replace('px', ''),
              pool: this.bookingEvent.POOL,
              nbOfDays: this.bookingEvent.NO_OF_DAYS,
            },
          });
          this.element.style.width = `${numberOfDays * this.dayWidth - this.eventSpace}px`;
        } else {
          this.element.style.left = `${this.initialLeft}px`;
          this.element.style.width = `${numberOfDays * this.dayWidth - this.eventSpace}px`;
        }
      }
    } else {
      console.log('still mouse up listening...');
    }
    this.isDragging = false;
    document.removeEventListener('mousemove', this.handleMouseMoveBind);
    document.removeEventListener('touchmove', this.handleMouseMoveBind);
    document.removeEventListener('pointermove', this.handleMouseMoveBind);

    document.removeEventListener('mouseup', this.handleMouseUpBind);
    document.removeEventListener('touchup', this.handleMouseUpBind);
    document.removeEventListener('pointerup', this.handleMouseUpBind);
  }

  updateData(data: any) {
    this.updateEventData.emit(data);
  }

  showEventInfo(showInfo) {
    if (this.isHighlightEventType() || this.bookingEvent.hideBubble) {
      return null;
    }

    if (showInfo) {
      // Calculate which side we need to show the bubble, top side or bottom.
      let bodyContainer = document.querySelector('.calendarScrollContainer');
      let bodyContainerRect: { [key: string]: any } = bodyContainer.getBoundingClientRect();
      let elementRect: { [key: string]: any } = this.element.getBoundingClientRect();
      let midPoint = bodyContainerRect.height / 2 + bodyContainerRect.top;
      // let topDifference = elementRect.top - bodyContainerRect.top;
      // let bottomDifference = bodyContainerRect.bottom - elementRect.bottom;

      if (elementRect.top < midPoint) {
        this.bubbleInfoTopSide = false;
      } else {
        this.bubbleInfoTopSide = true;
      }
    }

    // showInfo = true;
    if (showInfo) {
      this.hideBubbleInfo.emit({
        key: 'hidePopup',
        currentInfoBubbleId: this.getBookingId(),
      });
    }
    this.showInfoPopup = showInfo;
    this.renderAgain();
  }

  render() {
    // onMouseLeave={()=>this.showEventInfo(false)}
    let legend = this.getEventLegend();
    let noteNode = this.getNoteNode();
    let balanceNode = this.getBalanceNode();

    return (
      <Host
        class={`bookingEvent ${this.isNewEvent() || this.isHighlightEventType() ? 'newEvent' : ''} ${legend.clsName}`}
        style={this.getPosition()}
        id={'event_' + this.getBookingId()}
      >
        {/* onMouseOver={() =>this.showEventInfo(true)}  */}
        <div
          class={`bookingEventBase  ${this.isSplitBooking() ? 'splitBooking' : ''}`}
          style={{ backgroundColor: legend.color }}
          onTouchStart={event => this.startDragging(event, 'move')}
          onMouseDown={event => this.startDragging(event, 'move')}
        ></div>
        {noteNode ? <div class="legend_circle noteIcon" style={{ backgroundColor: noteNode.color }}></div> : null}
        {balanceNode ? <div class="legend_circle balanceIcon" style={{ backgroundColor: balanceNode.color }}></div> : null}
        {/* onMouseOver={() => this.showEventInfo(true)}  */}
        <div class="bookingEventTitle" onTouchStart={event => this.startDragging(event, 'move')} onMouseDown={event => this.startDragging(event, 'move')}>
          {this.getBookedBy()}
        </div>
        <div
          class="bookingEventDragHandle leftSide"
          onTouchStart={event => this.startDragging(event, 'leftSide')}
          onMouseDown={event => this.startDragging(event, 'leftSide')}
        ></div>
        <div
          class="bookingEventDragHandle rightSide"
          onTouchStart={event => this.startDragging(event, 'rightSide')}
          onMouseDown={event => this.startDragging(event, 'rightSide')}
        ></div>
        {this.showInfoPopup ? (
          <igl-booking-event-hover
            is_vacation_rental={this.is_vacation_rental}
            countryNodeList={this.countryNodeList}
            currency={this.currency}
            class="top"
            bookingEvent={this.bookingEvent}
            bubbleInfoTop={this.bubbleInfoTopSide}
          ></igl-booking-event-hover>
        ) : null}
      </Host>
    );
  }
}
