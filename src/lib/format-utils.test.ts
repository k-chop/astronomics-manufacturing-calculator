import { describe, expect, it } from "vitest";

import { formatDuration, formatNumber } from "./format-utils";

describe("formatDuration", () => {
  it("秒・分", () => {
    expect(formatDuration(0)).toBe("0s");
    expect(formatDuration(25)).toBe("25s");
    expect(formatDuration(60)).toBe("1m");
    expect(formatDuration(90)).toBe("1m 30s");
    expect(formatDuration(300)).toBe("5m");
  });

  it("時間", () => {
    expect(formatDuration(3600)).toBe("1h");
    expect(formatDuration(3600 + 300)).toBe("1h 5m");
    expect(formatDuration(2 * 3600 + 5)).toBe("2h 5s");
  });

  it("日", () => {
    expect(formatDuration(86400)).toBe("1d");
    expect(formatDuration(86400 + 3 * 3600 + 4 * 60 + 5)).toBe("1d 3h 4m 5s");
    expect(formatDuration(1500 * 86400)).toBe("1,500d");
  });
});

describe("formatNumber", () => {
  it("3桁ごとにカンマ区切りにする", () => {
    expect(formatNumber(0)).toBe("0");
    expect(formatNumber(999)).toBe("999");
    expect(formatNumber(1000)).toBe("1,000");
    expect(formatNumber(1000000000)).toBe("1,000,000,000");
    expect(formatNumber(367.5)).toBe("367.5");
  });
});
