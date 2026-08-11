import { MASTERY_MAP, MASTERY_OPTIONS } from "./mastery-mapping";

describe("mastery-mapping", () => {
  it("maps every mastery level to a config with a fill and track color", () => {
    for (const level of MASTERY_OPTIONS) {
      expect(MASTERY_MAP[level]).toBeDefined();
      expect(MASTERY_MAP[level].percent).toEqual(expect.any(Number));
      expect(MASTERY_MAP[level].fill).toMatch(/^#[0-9A-F]{6}$/i);
      expect(MASTERY_MAP[level].track).toMatch(/^#[0-9A-F]{6}$/i);
    }
  });

  it("covers every expected mastery level in increasing percent order", () => {
    expect(MASTERY_OPTIONS).toEqual(["Novice", "Advanced", "Competent", "Proficient", "Expert"]);
    const percents = MASTERY_OPTIONS.map((m) => MASTERY_MAP[m].percent);
    expect(percents).toEqual([20, 40, 60, 80, 100]);
  });
});
