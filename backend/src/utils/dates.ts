
export function isFutureDate(d: Date) {
  return d.getTime() > Date.now();
}

export function yearsBetween(older: Date, younger: Date) {
  const ms = younger.getTime() - older.getTime();
  return ms / (1000 * 60 * 60 * 24 * 365.25);
}
