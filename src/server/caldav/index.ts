import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import ICalParser from 'ical-js-parser';
import { rrulestr } from 'rrule';
import { createDAVClient } from 'tsdav';

import type { CalendarEvent, CalendarEventStatus } from '@/core';

export async function fetchEvents(params: { start: Dayjs; end: Dayjs }) {
  const client = await createDAVClient({
    serverUrl: 'https://caldav.feishu.cn',
    credentials: {
      username: process.env.USER_ID,
      password: process.env.USER_PASSWORD,
    },
    authMethod: 'Basic',
    defaultAccountType: 'caldav',
  });

  const defaultCalendar = (await client.fetchCalendars())[0];

  const calendarObjects = await client.fetchCalendarObjects({
    calendar: defaultCalendar,
    timeRange: {
      start: params.start.toISOString(),
      end: params.end.toISOString(),
    },
  });

  const map = new Map<string, CalendarEvent>();
  const selectedEvents: CalendarEvent[] = [];
  for (const calendarObject of calendarObjects) {
    if (calendarObject.data) {
      const calJSON = ICalParser.toJSON(calendarObject.data);
      for (const eventJSON of calJSON.events) {
        let start = dayjs(eventJSON.dtstart.value);
        let end = dayjs(eventJSON.dtend.value);
        let included = false;
        if (start.valueOf() >= params.start.valueOf() && end.valueOf() <= params.end.valueOf()) {
          included = true;
        } else if (eventJSON.rrule) {
          const rStart = rrulestr(eventJSON.rrule, {
            dtstart: start.toDate(),
          }).between(params.start.toDate(), params.end.toDate());
          if (rStart.length) {
            included = true;
            const rEnd = rrulestr(eventJSON.rrule, {
              dtstart: end.toDate(),
            }).between(params.start.toDate(), params.end.toDate());
            start = dayjs(rStart[0]);
            end = dayjs(rEnd[0]);
          }
        }
        const event: CalendarEvent = {
          id: eventJSON.uid as unknown as string,
          subject: eventJSON.summary ?? 'Untitled',
          location: extractLocation(eventJSON.location),
          startTime: start.valueOf(),
          endTime: end.valueOf(),
          status: eventJSON.status as unknown as CalendarEventStatus,
          rrule: eventJSON.rrule,
        };
        if (included) {
          if (map.has(event.id)) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            Object.assign(map.get(event.id)!, event);
          } else {
            map.set(event.id, event);
            selectedEvents.push(event);
          }
        }
      }
    }
  }

  selectedEvents.sort((a, b) => a.startTime - b.startTime);

  return selectedEvents;
}

function extractLocation(location: string | undefined) {
  if (location) {
    const locations = location.split(`\\,\\n`);
    for (const location of locations) {
      if (location.indexOf('Nanjing-Nanjingdaxue(南京大学)-') !== -1) {
        return location
          .replace('Nanjing-Nanjingdaxue(南京大学)-', '')
          .replace('🎦', '')
          .replace(/\([0-9]+\)/, '')
          .trim();
      }
    }
  }
  return undefined;
}
