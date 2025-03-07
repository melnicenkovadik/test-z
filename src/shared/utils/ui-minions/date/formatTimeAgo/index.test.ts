import { formatTimeAgo } from "./index";

describe("formatTimeAgo", () => {
  it("should return 'Few seconds ago' for a timestamp within the last minute", () => {
    const now = Date.now();
    const timestamp = now - 30000; // 30 seconds ago
    expect(formatTimeAgo(timestamp)).toBe("Few seconds ago");
  });

  it("should return 'A Minute ago' for a timestamp within the last minute", () => {
    const now = Date.now();
    const timestamp = now - 60000; // 60 seconds ago
    expect(formatTimeAgo(timestamp)).toBe("A Minute ago");
  });

  it("should return '2 Minutes ago' for a timestamp within the last minute", () => {
    const now = Date.now();
    const timestamp = now - 125000; // 125 seconds ago
    expect(formatTimeAgo(timestamp)).toBe("2 Minutes ago");
  });

  it("should return '1 Hour ago' for a timestamp 1 hour ago", () => {
    const now = Date.now();
    const timestamp = now - 3600000; // 1 hour ago
    expect(formatTimeAgo(timestamp)).toBe("1 Hour ago");
  });

  it("should return '2 Hours ago' for a timestamp 2 hours ago", () => {
    const now = Date.now();
    const timestamp = now - 7200000; // 2 hours ago
    expect(formatTimeAgo(timestamp)).toBe("2 Hours ago");
  });

  it("should return '1 Day ago' for a timestamp 1 day ago", () => {
    const now = Date.now();
    const timestamp = now - 86400000; // 1 day ago
    expect(formatTimeAgo(timestamp)).toBe("1 Day ago");
  });

  it("should return '2 Days ago' for a timestamp 2 days ago", () => {
    const now = Date.now();
    const timestamp = now - 172800000; // 2 days ago
    expect(formatTimeAgo(timestamp)).toBe("2 Days ago");
  });

  it("should return '1 Month ago' for a timestamp 1 month ago", () => {
    const now = Date.now();
    const timestamp = now - 2628000000; // 1 month ago
    expect(formatTimeAgo(timestamp)).toBe("1 Month ago");
  });

  it("should return '2 Months ago' for a timestamp 2 months ago", () => {
    const now = Date.now();
    const timestamp = now - 5256000000; // 2 months ago
    expect(formatTimeAgo(timestamp)).toBe("2 Months ago");
  });

  it("should return '1 Year ago' for a timestamp 1 year ago", () => {
    const now = Date.now();
    const timestamp = now - 31536000000; // 1 year ago
    expect(formatTimeAgo(timestamp)).toBe("1 Year ago");
  });

  it("should return '2 Years ago' for a timestamp 2 years ago", () => {
    const now = Date.now();
    const timestamp = now - 63072000000; // 2 years ago
    expect(formatTimeAgo(timestamp)).toBe("2 Years ago");
  });
});
