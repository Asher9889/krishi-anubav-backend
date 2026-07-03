export function toISODate(date: string): string {
  const [day, month, year] = date.split("-");
  return `${year}-${month}-${day}`;
}

export const todayISODate = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format

