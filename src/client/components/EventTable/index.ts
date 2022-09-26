import { format2Digits, formatTime, normalizeTime, now } from '@/client/utils';
import type { CalendarEvent } from '@/core';

import styles from './index.module.less';

const HOUR_ROW_HEIGHT = 70;
const PADDING_TOP = 12;

export class EventTable {
  readonly container = document.createElement('div');

  private _body = document.createElement('div');
  private _cursor = document.createElement('div');
  private _eventElements: HTMLDivElement[] = [];

  private _events: CalendarEvent[] = [];

  constructor() {
    this.container.className = styles.container;

    this._body.className = styles.body;
    this.container.appendChild(this._body);

    this._cursor.className = styles.cursor;
    this._cursor.innerHTML = '<span>';
    this.container.appendChild(this._cursor);

    this._initTable();
  }

  getEvents() {
    return this._events;
  }
  setEvents(value: CalendarEvent[]) {
    this._events = value;
    this._updateEvents();
  }

  update() {
    const t = now();
    const hours = t.getHours();
    this._cursor.style.top = this._calculateY(hours, t.getMinutes()) + `px`;
    const scrollTop = this._calculateY(hours <= 14 ? hours : 14) - 12;
    if (scrollTop != this.container.scrollTop) {
      this.container.scrollTop = scrollTop;
    }
  }

  private _initTable() {
    for (let hour = 0; hour <= 24; hour++) {
      const hourRow = document.createElement('div');
      hourRow.className = styles.hourRow;
      hourRow.style.height = `${HOUR_ROW_HEIGHT}px`;
      const label = document.createElement('span');
      label.className = styles.hourLabel;
      label.innerText = `${format2Digits(hour)}:00`;
      hourRow.appendChild(label);
      this._body.appendChild(hourRow);
    }
  }

  private _updateEvents() {
    const events = this._events;

    while (this._eventElements.length > events.length) {
      const element = this._eventElements.pop();
      element?.parentNode?.removeChild(element);
    }

    while (this._eventElements.length < events.length) {
      const element = this._appendEventElement();
      this._eventElements.push(element);
    }

    events.forEach((event, i) => {
      const element = this._eventElements[i];
      this._updateEvent(event, element);
    });
  }

  private _appendEventElement() {
    const container = document.createElement('div');
    container.className = styles.event;

    const content = document.createElement('div');
    content.className = styles.content;
    container.appendChild(content);

    const subject = document.createElement('h3');
    subject.className = styles.subject;
    content.appendChild(subject);

    const time = document.createElement('div');
    time.className = styles.time;
    content.appendChild(time);

    this.container.appendChild(container);
    return container;
  }

  private _updateEvent(event: CalendarEvent, container: HTMLDivElement) {
    const content = container.children[0] as HTMLElement;
    const subject = content.children[0] as HTMLElement;
    const time = content.children[1] as HTMLElement;

    const startTime = normalizeTime(event.startTime);
    const endTime = normalizeTime(event.endTime);
    const duration = endTime.getTime() - startTime.getTime();

    container.id = event.id;
    subject.innerText = event.subject;
    time.innerText = `${formatTime(startTime)} - ${formatTime(endTime)}${event.location ? ',  ' + event.location : ''}`;

    const height = (duration / 60 / 60 / 1000) * HOUR_ROW_HEIGHT;
    container.style.height = `${height}px`;
    container.style.top = `${this._calculateY(startTime.getHours(), startTime.getMinutes())}px`;
    if (height < 40) {
      container.classList.add(styles.smallest);
      container.classList.remove(styles.smaller);
    } else if (height < 60) {
      container.classList.add(styles.smaller);
      container.classList.remove(styles.smallest);
    } else {
      container.classList.remove(styles.smaller);
      container.classList.remove(styles.smallest);
    }
  }

  private _calculateY(hours: number, minutes = 0) {
    return PADDING_TOP + (hours + minutes / 60) * HOUR_ROW_HEIGHT;
  }
}
