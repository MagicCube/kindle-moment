import type { CalendarEventStatus } from './CalendarEventStatus';

export interface CalendarEvent {
  id: string;
  subject: string;
  status: CalendarEventStatus;
  startTime: number;
  endTime: number;
  location?: string;
  rrule?: string;
  raw?: Record<string, unknown>;
}
