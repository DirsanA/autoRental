export function startOfMonthUTC(year: number, month1to12: number) {
  const y = Number(year);
  const m = Number(month1to12);
  if (!Number.isFinite(y) || !Number.isFinite(m) || m < 1 || m > 12) {
    throw new Error("Invalid year/month");
  }

  // Use UTC boundaries so month selection is stable across timezones.
  return new Date(Date.UTC(y, m - 1, 1, 0, 0, 0, 0));
}

export function startOfNextMonthUTC(year: number, month1to12: number) {
  const start = startOfMonthUTC(year, month1to12);
  return new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + 1, 1, 0, 0, 0, 0));
}
