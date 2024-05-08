import { formatDate, formatTime, now } from '@/client/utils';

import styles from './index.module.less';

export class Clock {
  container = document.createElement('div');

  private _dateText = '';
  private _timeText = '';

  private _dateElement = document.createElement('div');
  private _timeElement = document.createElement('div');

  constructor() {
    this.container.className = styles.container;

    this._dateElement.className = styles.date;
    this.container.appendChild(this._dateElement);

    this._timeElement.className = styles.time;
    this.container.appendChild(this._timeElement);
  }

  update() {
    const t = now(60 * 1000);
    const date = formatDate(t);
    const time = formatTime(t);
    if (date !== this._dateText) {
      this._dateText = date;
      this._dateElement.innerText = this._dateText;
    }
    if (time !== this._timeText) {
      this._timeText = time;
      this._timeElement.innerText = this._timeText;
    }
  }
}
