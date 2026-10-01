import { describe, expect, it } from "vitest";

import {
  businessDateAndTime,
  dateWithBusinessTime,
  formatBusinessTime,
} from "@/lib/utils/date";

describe("business date helpers", () => {
  it("keeps a booking at its local business hour", () => {
    const start = dateWithBusinessTime("2026-09-30", "09:30");
    expect(formatBusinessTime(start)).toBe("09:30");
    expect(businessDateAndTime(start)).toEqual({
      date: "2026-09-30",
      time: "09:30",
    });
  });

  it("returns the correct business date around midnight UTC", () => {
    expect(businessDateAndTime("2026-10-01T02:30:00.000Z")).toEqual({
      date: "2026-09-30",
      time: "22:30",
    });
  });
});
