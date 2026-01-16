export function getHoursColor(periods?: {
  open: { day: number; hour: number; minute: number };
  close?: { day: number; hour: number; minute: number };
}[]) {
  if (!periods || periods.length === 0) {
    return "#9CA3AF"; // gray (no data)
  }

  const now = new Date();
  const nowDay = now.getDay(); // 0–6 (Sunday = 0)

  // Convert a period open/close to actual Date objects
  const toDateForThisWeek = (
    day: number,
    hour: number,
    minute: number
  ) => {
    const d = new Date(now);
    const diff = day - nowDay;
    d.setDate(now.getDate() + diff);
    d.setHours(hour, minute, 0, 0);
    return d;
  };

  let isOpen = false;
  let nextClose: Date | null = null;

  for (const period of periods) {
    const openTime = toDateForThisWeek(
      period.open.day,
      period.open.hour,
      period.open.minute
    );

    const closeTime = period.close
      ? toDateForThisWeek(
          period.close.day,
          period.close.hour,
          period.close.minute
        )
      : null;

    // Handle overnight (close on next day)
    if (closeTime && closeTime <= openTime) {
      closeTime.setDate(closeTime.getDate() + 7);
    }

    if (now >= openTime && (!closeTime || now < closeTime)) {
      isOpen = true;
      nextClose = closeTime;
      break;
    }
  }

  // Closed
  if (!isOpen) {
    return "#9CA3AF"; // gray
  }

  // Open but no close time known
  if (!nextClose) {
    return "#16A34A"; // green
  }

  const minutesUntilClose =
    (nextClose.getTime() - now.getTime()) / 1000 / 60;

  if (minutesUntilClose <= 30) {
    return "#FACC15"; // yellow (closing soon)
  }

  return "#16A34A"; // green (open)
}
