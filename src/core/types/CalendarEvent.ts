import type { CalendarEventStatus } from './CalendarEventStatus';

export interface CalendarEvent {
  id: string;
  subject: string;
  status: CalendarEventStatus;
  startTime: number;
  endTime: number;
  timeRange: string;
  location?: string;
  rrule?: string;
}
