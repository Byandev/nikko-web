export function currencyFormatter(
  number: number,
  currency_code: string = 'USD'
): string {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency_code,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  return formatter.format(number);
}

export function timeAgo(timestamp: string): string {
  const now = new Date();
  const time = new Date(timestamp);
  const diff = (Math.abs(now.getTime() - time.getTime())/1000);

  if (diff < 60) {
    return "Just now";
  } else if (diff < 3600) {
    const minutes = Math.floor(diff / 60);
    return minutes === 1 ? "1 minute ago" : `${minutes} minutes ago`;
  } else if (diff < 86400) {
    const hours = Math.floor(diff / 3600);
    return hours === 1 ? "1 hour ago" : `${hours} hours ago`;
  } else if (diff < 2592000) {
    const days = Math.floor(diff / 86400);
    return days === 1 ? "1 day ago" : `${days} days ago`;
  } else if (diff < 31536000) {
    const months = Math.floor(diff / 2592000);
    return months === 1 ? "1 month ago" : `${months} months ago`;
  } else {
    const years = Math.floor(diff / 31536000);
    return years === 1 ? "1 year ago" : `${years} years ago`;
  }
}

export function formatDayTime(dateString: string): string {
  // Convert the string into a Date object
  const date = new Date(dateString);

  // Array of weekday abbreviations
  const days = ["Sun", "Mon", "Tues", "Wed", "Thurs", "Fri", "Sat"];

  // Get the day abbreviation
  const day = days[date.getDay()];

  // Get hours and minutes in 24-hour format, with zero-padding
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${day}, ${hours}:${minutes}`;
}