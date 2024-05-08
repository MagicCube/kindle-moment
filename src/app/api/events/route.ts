import dayjs from 'dayjs';

import { fetchEvents } from '@/server/caldav';

process.env.TZ = 'Asia/Shanghai';

export async function GET(req: Request) {
  console.info('Updating from caldav.feishu.cn...');
  const today = dayjs().startOf('day');
  try {
    console.info('Updating events...');
    const params = new URL(req.url).searchParams;
    let start = today;
    let end = today.add(1, 'day');
    if (params.has('date')) {
      start = dayjs(params.get('date') as string);
      end = start.add(1, 'day');
    } else if (params.has('d')) {
      start = dayjs(params.get('d') as string);
      end = start.add(1, 'day');
    } else if (params.has('start')) {
      start = dayjs(params.get('start') as string);
      if (params.has('end')) {
        end = dayjs(params.get('end') as string);
      } else {
        end = start.add(1, 'day');
      }
    }
    let events = await fetchEvents({
      start,
      end,
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
