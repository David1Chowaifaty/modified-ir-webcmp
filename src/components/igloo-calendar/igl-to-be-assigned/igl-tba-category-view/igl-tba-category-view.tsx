import { Component, Host, Prop, State, h, Event, EventEmitter } from '@stencil/core';

@Component({
  tag: 'igl-tba-category-view',
  styleUrl: 'igl-tba-category-view.css',
  scoped: true,
})
export class IglTbaCategoryView {
  @Event() assignUnitEvent: EventEmitter<{ [key: string]: any }>;
  @Prop() calendarData: { [key: string]: any };
  @Prop() selectedDate;
  @Prop() categoriesData: { [key: string]: any } = {};
  @Prop() categoryId;
  @Prop({ mutable: true }) eventDatas;
  @Prop() categoryIndex;
  @State() renderAgain: boolean = false;

  // private localEventDatas;

  componentWillLoad() {
    // this.localEventDatas = this.eventDatas;
  }

  handleAssignRoomEvent(event: CustomEvent<{ [key: string]: any }>) {
    event.stopImmediatePropagation();
    event.stopPropagation();

    const opt: { [key: string]: any } = event.detail;
    this.eventDatas = this.eventDatas.filter(eventData => eventData.ID != opt.data.ID);
    this.calendarData.bookingEvents.push(opt.data);
    this.assignUnitEvent.emit({
      key: 'assignUnit',
      data: {
        RT_ID: this.categoryId,
        selectedDate: this.selectedDate,
        assignEvent: opt.data,
        calendarData: this.calendarData,
      },
    });
    // if(this.localEventDatas.length){
    this.renderView();
    // }
  }

  getEventView(categoryId, eventDatas) {
    return eventDatas.map((eventData, ind) => (
      <igl-tba-booking-view
        calendarData={this.calendarData}
        selectedDate={this.selectedDate}
        eventData={eventData}
        categoriesData={this.categoriesData}
        categoryId={categoryId}
        categoryIndex={this.categoryIndex}
        eventIndex={ind}
        onAssignRoomEvent={evt => this.handleAssignRoomEvent(evt)}
      ></igl-tba-booking-view>
    ));
  }

  renderView() {
    this.renderAgain = !this.renderAgain;
  }

  render() {
    return (
      <Host>
        <div class="sectionContainer">
          <div class="font-weight-bold mt-1 font-small-3">{this.categoriesData[this.categoryId]?.name}</div>
          {this.getEventView(this.categoryId, this.eventDatas)}
        </div>
      </Host>
    );
  }
}
