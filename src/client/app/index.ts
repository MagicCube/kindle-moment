import type { CalendarEvent } from '@/core';

import { Clock } from '../components/Clock';
import { EventTable } from '../components/EventTable';
import { showEventAlert } from '../components/MessageBox';
import { now } from '../utils';

import styles from './index.module.less';

export class Application {
  private _clock: Clock;
  private _eventTable: EventTable;

  updateInterval = 60 * 1000;

  constructor(readonly container: HTMLElement) {
    if (window.location.port === '3000') {
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
      if (delta >= -4 * 60 * 1000 && delta <= -3 * 60 * 1000) {
        showEventAlert(event);
        break;
      }
    }
  }

  async start() {
    await this._updateEvents();
    this.update();
    setInterval(this._updateEvents, this.updateInterval);

    const t = now();
    const firstUpdate = (60 - t.getSeconds()) * 1000;
    console.info(`Will update in ${firstUpdate}ms.`);
    setTimeout(() => {
      this.update();

      setInterval(() => {
        const t = now();
        const hours = t.getHours();
        if ((hours >= 0 && hours <= 7) || hours >= 22) {
          // In the early morning, sleep for a while.
          return;
        } else {
          this.update();
        }
      }, 60 * 1000);
    }, firstUpdate);
  }

  private _updateEvents = async () => {
    const events = await this._request<CalendarEvent[]>('api/events');
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
