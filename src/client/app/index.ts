import type { CalendarEvent } from '@/core';

import { Clock } from '../components/Clock';
import { EventTable } from '../components/EventTable';
import { showEventAlert } from '../components/MessageBox';
import { now } from '../utils';

import styles from './index.module.less';

export class Application {
  private _clock: Clock;
  private _eventTable: EventTable;

  constructor(readonly container: HTMLElement) {
    if (window.location.port === '5173') {
      document.title = 'DEV - Kindle Moment';
    }

    const header = document.createElement('div');
    header.className = styles.header;
    this.container.appendChild(header);

    const content = document.createElement('div');
    content.className = styles.content;
    this.container.appendChild(content);

    this._clock = new Clock();
    header.appendChild(this._clock.container);

    this._eventTable = new EventTable();
    this._eventTable.container.style.height = `728px`;
    content.appendChild(this._eventTable.container);
  }

  update() {
    console.info('Update');

    this._clock.update();
    this._eventTable.update();

    const events = this._eventTable.getEvents();
    for (const event of events) {
      const delta = Date.now() - event.startTime;
      if (delta >= -3 * 60 * 1000 && delta <= -2 * 60 * 1000) {
        showEventAlert(event);
        break;
      }
    }
  }

  async start() {
    await this._updateEvents();
    this.update();
    setInterval(this._updateEvents, 3 * 60 * 1000);

    const updateEverySecond = false;
    if (updateEverySecond) {
      setInterval(() => {
        this.update();
      }, 1000);
    } else {
      const t = now();
      console.info(`Will update in ${61 - t.getSeconds()} seconds.`);
      setTimeout(() => {
        this.update();

        setInterval(() => {
          this.update();
        }, 60 * 1000);
      }, (61 - t.getSeconds()) * 1000);
    }
  }

  private _updateEvents = async () => {
    const events = await this._request<CalendarEvent[]>('data/events.json');
    // events.push({
    //   id: 'abc',
    //   subject: '测试 Test',
    //   startTime: Date.now() + 3 * 60 * 1000 + 2 * 1000,
    //   endTime: Date.now() + 5 * 60 * 1000,
    //   location: 'F11-06',
    //   status: CalendarEventStatus.Confirmed,
    // });
    this._eventTable.setEvents(events);
  };

  private _request<T>(path: string): Promise<T> {
    return new Promise((resolve) => {
      const request = new XMLHttpRequest();
      request.onreadystatechange = () => {
        if (request.readyState === 4) {
          request.onreadystatechange = null;
          if (request.status === 200) {
            const jsonString = request.responseText;
            const json = JSON.parse(jsonString);
            resolve(json as T);
          }
        }
      };
      request.open('GET', path + '?t=' + Date.now());
      request.send();
    });
  }
}
