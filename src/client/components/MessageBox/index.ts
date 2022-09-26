import { formatTime, normalizeTime } from '@/client/utils';
import type { CalendarEvent } from '@/core';

import styles from './index.module.less';

export class MessageBox {
  readonly container = document.createElement('div');

  private _content = document.createElement('div');
  private _subject = document.createElement('h2');
  private _time = document.createElement('div');
  private _location = document.createElement('div');
  private _buttonRow = document.createElement('div');
  private _button = document.createElement('button');

  constructor() {
    this.container.className = styles.container;

    this._content.className = styles.content;
    this.container.appendChild(this._content);

    this._subject.className = styles.subject;
    this._content.appendChild(this._subject);

    this._time.className = styles.time;
    this._content.appendChild(this._time);

    this._location.className = styles.location;
    this._content.appendChild(this._location);

    this._button.className = styles.button;
    this._button.innerText = '好的，知道了';
    this._buttonRow.className = styles.buttonRow;
    this._buttonRow.appendChild(this._button);
    this._button.addEventListener('click', this._handleOK, true);
    this._content.appendChild(this._buttonRow);
  }

  showEventAlert(e: CalendarEvent) {
    this._clearAutoHideTimer();

    this._subject.innerText = e.subject;
    this._time.innerText =
      '时间：' + formatTime(normalizeTime(e.startTime)) + ' - ' + formatTime(normalizeTime(e.endTime));
    if (e.location) {
      this._location.innerText = '会议室：' + e.location;
    }
    this._location.style.display = e.location ? 'block' : 'none';

    this._autoHide();
  }

  hide() {
    this._clearAutoHideTimer();
    this.container.parentNode?.removeChild(this.container);
  }

  private _autoHideTimer = 0;
  private _autoHide() {
    this._autoHideTimer = window.setTimeout(() => {
      this.hide();
    }, 4 * 60 * 1000);
  }

  private _clearAutoHideTimer() {
    if (this._autoHideTimer) {
      window.clearTimeout(this._autoHideTimer);
      this._autoHideTimer = 0;
    }
  }

  private _handleOK = () => {
    this.hide();
  };
}

const messageBox = new MessageBox();
export function showEventAlert(event: CalendarEvent) {
  document.body.appendChild(messageBox.container);
  messageBox.showEventAlert(event);
}

export function hideMessageBox() {
  messageBox.hide();
}
