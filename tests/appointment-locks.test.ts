import { describe, expect, it } from "vitest";

import { getAppointmentLockIds } from "@/lib/server/appointment-locks";

describe("appointment interval locks", () => {
  it("creates one lock for every overlapping 15-minute interval", () => {
    expect(getAppointmentLockIds("2026-10-20", "09:00", 45)).toEqual([
      "2026-10-20_09-00",
      "2026-10-20_09-15",
      "2026-10-20_09-30",
    ]);
  });

  it("makes different start times share locks when their intervals overlap", () => {
    const first = getAppointmentLockIds("2026-10-20", "09:00", 45);
    const second = getAppointmentLockIds("2026-10-20", "09:30", 30);

    expect(first.some((lock) => second.includes(lock))).toBe(true);
    expect(
      first.some((lock) =>
        getAppointmentLockIds("2026-10-20", "09:45", 30).includes(lock),
      ),
    ).toBe(false);
  });
});
