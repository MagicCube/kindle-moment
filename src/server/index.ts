import dayjs from 'dayjs';
import 'dotenv/config';
import express from 'express';
import fs from 'fs';

import type { CalendarEvent } from '@/core';

import { fetchEvents } from './caldav';

const UPDATE_INTERVAL = 3 * 60 * 1000;

let events: CalendarEvent[] = [];

const app = express();
app.use(express.static('./dist'));
app.get('/data/events.json', (req, res) => {
  res.json(events);
});

function main() {
  if (!fs.existsSync('./data')) {
    fs.mkdirSync('./data');
  }
  if (fs.existsSync('./data/events.json')) {
    events = JSON.parse(fs.readFileSync('./data/events.json').toString());
  }
  app.listen(8888);
  update();
}

async function update() {
  console.info('Updating from caldav.feishu.cn...');
  const today = dayjs().startOf('day');
  // const today = dayjs('2022-09-27');
  try {
    console.info('Updating events...');
    events = await fetchEvents({
      start: today,
      end: today.add(1, 'day'),
    });
    if (events.length === 0) {
      console.info(`No event found.`);
    } else if (events.length) {
      events = events.filter((event) => event.startTime >= today.valueOf());
      console.info(`${events.length} events updated.`);
      fs.writeFileSync('./data/events.json', JSON.stringify(events));
    }
  } catch (e) {
    console.error(e);
  }
  console.info('DONE\n');
  setTimeout(() => {
    update();
  }, UPDATE_INTERVAL);
}

main();
