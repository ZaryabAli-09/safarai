const MINUTE = 60;
const HOUR = MINUTE * 60;
const DAY = HOUR * 24;
const WEEK = DAY * 7;
const MONTH = DAY * 30;
const YEAR = DAY * 365;

/**
 * Compact "time ago" label for post and comment timestamps
 * ("just now", "8 minutes ago", "3 days ago", "2 years ago").
 *
 * Hand-rolled to keep the client bundle free of a date library.
 */
export function formatTimeAgo(value: string | Date): string {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 45) return "just now";

  const units: { seconds: number; singular: string }[] = [
    { seconds: YEAR, singular: "year" },
    { seconds: MONTH, singular: "month" },
    { seconds: WEEK, singular: "week" },
    { seconds: DAY, singular: "day" },
    { seconds: HOUR, singular: "hour" },
    { seconds: MINUTE, singular: "minute" },
  ];

  for (const unit of units) {
    const amount = Math.floor(seconds / unit.seconds);
    if (amount >= 1) {
      return `${amount} ${unit.singular}${amount === 1 ? "" : "s"} ago`;
    }
  }

  return "just now";
}
