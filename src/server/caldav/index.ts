import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import ICalParser from 'ical-js-parser';
import { rrulestr } from 'rrule';
import type { DAVObject } from 'tsdav';
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

  const calendars = await client.fetchCalendars();
  const calendarObjects: DAVObject[] = [];
  for (const calendar of calendars) {
    const objs = await client.fetchCalendarObjects({
      calendar: calendar,
      timeRange: {
        start: params.start.toISOString(),
        end: params.end.toISOString(),
      },
    });
    calendarObjects.push(...objs);
  }

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
          subject: simplifySubject(eventJSON.summary),
          location: extractLocation(eventJSON.location),
          startTime: start.valueOf(),
          endTime: end.valueOf(),
          timeRange: `${start.format('HH:mm')}-${end.format('HH:mm')}`,
          status: eventJSON.status as unknown as CalendarEventStatus,
          rrule: eventJSON.rrule,
        };
        if (event.status === 'CANCELLED') {
          continue;
        }
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

function simplifySubject(subject: string | undefined) {
  if (subject) {
    if (subject.startsWith('视频面试：')) {
      subject = subject.replace('视频面试：', '面试：');
      if (subject.endsWith('）')) {
        const index = subject.indexOf('（');
        if (index !== -1) {
          subject = subject.slice(0, index);
        }
      }
    }
    return subject;
  }
  return 'Untitled';
}

function extractLocation(location: string | undefined) {
  if (location) {
    const locations = location.split(`\\,\\n`);
    const buildingName = 'Shanghai-Caohejing Center Block C(漕河泾中心C座)-';
    for (const location of locations) {
      if (location.indexOf(buildingName) !== -1) {
        return location
          .replace(buildingName, '')
          .replace('🎦', '')
          .replace(/\([0-9]+\)/, '')
          .trim();
      }
    }
  }
  return undefined;
}
