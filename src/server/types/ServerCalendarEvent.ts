import type { Dayjs } from 'dayjs';

import type { CalendarEvent } from '@/core';

export interface ServerCalendarEvent extends CalendarEvent {
  start: Dayjs;
  end: Dayjs;
  rrule?: string;
}
