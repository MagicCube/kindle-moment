import dayjs from 'dayjs';

import { fetchEvents } from '@/server/caldav';

process.env.TZ = 'Asia/Shanghai';

export async function GET() {
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
    return new Response(JSON.stringify(events), {
      headers: {
        'Cache-Control': 'no-store',
        'Content-Type': 'application/json',
      },
    });
  } catch (e) {
    console.error(e);
    return new Response(`Internal Server Error: ${e instanceof Error ? e.message : 'Unknown'}`, { status: 500 });
  }
}
