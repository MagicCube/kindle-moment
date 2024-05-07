import dayjs from 'dayjs';
import 'dotenv/config';
import express from 'express';
import fs from 'fs';

import { fetchEvents } from './caldav';

const app = express();
app.use(express.static('./dist'));
app.get('/api/events', async (req, res) => {
  console.info('Updating from caldav.feishu.cn...');
  const today = dayjs().startOf('day');
  try {
    console.info('Updating events...');
    let events = await fetchEvents({
      start: today,
      end: today.add(1, 'day'),
    });
    if (events.length === 0) {
      console.info(`No event found.`);
    } else if (events.length) {
      events = events.filter((event) => event.startTime >= today.valueOf());
      console.info(`${events.length} events updated.`);
    }
    res.json(events);
  } catch (e) {
    console.error(e);
    res.status(500);
  }
});

function main() {
  if (!fs.existsSync('./data')) {
    fs.mkdirSync('./data');
  }
  app.listen(8888);
}

main();
