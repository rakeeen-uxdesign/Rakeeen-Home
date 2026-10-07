/** What the Home date tile shows: today's day of the month and the month's name. */

export interface DateParts {
  /** 1–31 */
  day: number;
  /** "October" */
  monthName: string;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export function getDateParts(now: Date = new Date()): DateParts {
  return { day: now.getDate(), monthName: MONTH_NAMES[now.getMonth()] };
}
