const DAYS = ['日', '一', '二', '三', '四', '五', '六'];

export function now(offset = 0) {
  const date = normalizeTime(Date.now() + offset);
  return date;
}

export function normalizeTime(timestamp: number) {
  const date = new Date(timestamp);
  const utc8DiffMinutes = date.getTimezoneOffset() + 8 * 60;
  date.setMinutes(date.getMinutes() + utc8DiffMinutes);
  return date;
}

export function formatDate(date: Date) {
  const day = isActivityDay(date) ? '活动日' : '星期' + DAYS[date.getDay()];
  return date.getMonth() + 1 + '月' + date.getDate() + '日 ' + day;
}

export function formatTime(date: Date) {
  return format2Digits(date.getHours()) + ':' + format2Digits(date.getMinutes());
}

export function format2Digits(num: number) {
  if (num < 10) {
    return '0' + num;
  }
  return num.toString();
}

export function isActivityDay(date: Date | string) {
  if (typeof date === 'string') {
    date = new Date(date);
  }
  return (
    (Math.abs(
      new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime() - new Date(2024, 4, 15).getTime()
    ) /
      24 /
      60 /
      60 /
      1000) %
      14 ===
    0
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(window as any).isActivityDay = isActivityDay;
