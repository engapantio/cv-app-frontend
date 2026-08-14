import { generatePagination } from "./pagination";

describe("generatePagination", () => {
  it("returns all pages when the total is small", () => {
    expect(generatePagination(1, 3)).toEqual([1, 2, 3]);
  });

  it("inserts an ellipsis for skipped pages in the middle", () => {
    expect(generatePagination(5, 10)).toEqual([1, "...", 4, 5, 6, "...", 10]);
  });

  it("keeps the current page plus neighbours within delta", () => {
    expect(generatePagination(1, 10)).toEqual([1, 2, "...", 10]);
  });

  it("honours a custom delta", () => {
    expect(generatePagination(5, 10, 2)).toEqual([1, "...", 3, 4, 5, 6, 7, "...", 10]);
  });
});
